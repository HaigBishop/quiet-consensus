/*
Secret Network polling contract interaction functions.
Provides hooks for executing polling contracts and querying poll data with permit-based authentication.
*/

import { useContext } from "react";
import { SECRET_CHAIN_ID, SecretJsContext } from "./SecretJsContext";
import { QueryError, WalletError } from "./SecretJsErrors";
import { POLLING_CONTRACT_ADDRESS, POLLING_CONTRACT_CODE_HASH, SCT_CONTRACT_ADDRESS, SCT_CODE_HASH } from "../config";
import type { Permit } from "secretjs";
import type { Poll } from "../types";

const contractCodeHash = POLLING_CONTRACT_CODE_HASH;
const contractAddress = POLLING_CONTRACT_ADDRESS;

// Contract response types
type GetPollsResponse = {
    get_polls: {
        polls: Array<{
            poll_id: string;
            title: string;
            description: string;
            created_at: {
                seconds: number;
                nanos: number;
            };
            options: string[];
            tally: number[];
        }>;
    };
} | string;

type GetNumPollsResponse = {
    get_num_polls: {
        num_polls: number;
    };
} | string;

type GetMyVoteResponse = {
    get_my_vote: {
        vote: number | null;
    };
} | string;

// SCT contract response types
type SCTTokensResponse = {
    token_list: {
        tokens: string[];
    };
} | string;

const SecretJsFunctions = () => {
    const context = useContext(SecretJsContext);

    if (!context) {
        throw new Error("SecretJsFunctions must be used within a SecretjsContextProvider");
    }

    const { secretJs, secretAddress } = context;

    // Execute: Create a new poll
    const makePoll = async (
        title: string,
        description: string,
        options: string[]
    ): Promise<void> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const makePollMsg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                make_poll: {
                    title,
                    description,
                    options
                }
            }
        };

        console.log("Making poll:", makePollMsg);
        const tx = await secretJs.tx.compute.executeContract(
            makePollMsg,
            {
                gasLimit: 100_000,
            }
        );

        console.log("Poll created:", tx);
    };

    // Execute: Cast a vote on a poll
    const castVote = async (
        pollId: string,
        optionIdx: number
    ): Promise<void> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const castVoteMsg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                cast_vote: {
                    poll_id: pollId,
                    option_idx: optionIdx
                }
            }
        };

        console.log("Casting vote:", castVoteMsg);
        const tx = await secretJs.tx.compute.executeContract(
            castVoteMsg,
            {
                gasLimit: 100_000,
            }
        );

        console.log("Vote cast:", tx);
    };

    // Query: Get all polls
    const getPolls = async (): Promise<Poll[]> => {
        if (!secretJs) throw new WalletError("no wallet connected");

        const getPollsMsg = {
            contract_address: contractAddress,
            query: {
                get_polls: {}
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(getPollsMsg) as GetPollsResponse;

        console.log("Get polls result:", result);

        if (typeof result === "string") {
            throw new QueryError(result);
        }

        // Convert contract poll format to frontend Poll type
        return result.get_polls.polls.map(poll => {
            let createdAt: Date;
            
            // Handle different timestamp formats
            if (typeof poll.created_at === 'number') {
                // If it's a number, assume it's nanoseconds since epoch
                createdAt = new Date(poll.created_at / 1_000_000); // Convert nanoseconds to milliseconds
            } else if (poll.created_at && typeof poll.created_at === 'object' && 'seconds' in poll.created_at) {
                // If it's an object with seconds property
                createdAt = new Date(poll.created_at.seconds * 1000);
            } else {
                // Fallback
                console.warn('Unknown timestamp format:', poll.created_at);
                createdAt = new Date(); // Use current time as fallback
            }
            
            return {
                pollId: poll.poll_id,
                title: poll.title,
                description: poll.description,
                createdAt,
                options: poll.options.map((text, index) => ({
                    optionId: `opt-${index}`,
                    text
                })),
                tally: poll.tally
            };
        });
    };

    // Query: Get number of polls
    const getNumPolls = async (): Promise<number> => {
        if (!secretJs) throw new WalletError("no wallet connected");

        const getNumPollsMsg = {
            contract_address: contractAddress,
            query: {
                get_num_polls: {}
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(getNumPollsMsg) as GetNumPollsResponse;

        if (typeof result === "string") {
            throw new QueryError(result);
        }

        return result.get_num_polls.num_polls;
    };

    // Query: Get user's vote on a specific poll (requires permit)
    const getMyVote = async (pollId: string): Promise<number | null> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const permit = await getPermit();

        const getMyVoteMsg = {
            contract_address: contractAddress,
            query: {
                with_permit: {
                    permit,
                    query: {
                        get_my_vote: {
                            poll_id: pollId
                        }
                    }
                }
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(getMyVoteMsg) as GetMyVoteResponse;

        if (typeof result === "string") {
            throw new QueryError(result);
        }

        return result.get_my_vote.vote;
    };

    // Permit storage key
    const storageKey = `${secretAddress}:${contractAddress}:queryPermit`;

    // Helper function to create query permit. Caches in localStorage
    const getPermit = async (): Promise<Permit> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const queryPermitStored = localStorage.getItem(storageKey);

        let permit: Permit;
        if (queryPermitStored) {
            permit = JSON.parse(queryPermitStored);
        } else {
            permit = await secretJs.utils.accessControl.permit.sign(
                secretAddress,
                SECRET_CHAIN_ID,
                "Polling query permit",
                [contractAddress],
                ["owner"],
                true
            );
            localStorage.setItem(storageKey, JSON.stringify(permit));
        }

        return permit;
    };

    // SCT Functions
    
    // Create a viewing key for the SCT contract
    const createSCTViewingKey = async (): Promise<string> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        // Generate a random viewing key
        const viewingKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Create the set viewing key message
        const setViewingKeyMsg = {
            sender: secretAddress,
            contract_address: SCT_CONTRACT_ADDRESS,
            code_hash: SCT_CODE_HASH,
            msg: {
                set_viewing_key: {
                    key: viewingKey
                }
            }
        };
        
        // Execute the set viewing key transaction
        const tx = await secretJs.tx.compute.executeContract(
            setViewingKeyMsg,
            {
                gasLimit: 100_000,
            }
        );
        
        // Check if transaction was successful
        if (tx.code !== 0) {
            throw new Error(`Set viewing key failed with code ${tx.code}: ${tx.rawLog}`);
        }
        
        console.log('SCT viewing key created:', viewingKey);
        return viewingKey;
    };

    // Check if the current wallet has any SCT NFTs
    const checkSCTOwnership = async (): Promise<boolean> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        try {
            // First, try to get or create a viewing key
            const storageKey = `${secretAddress}:${SCT_CONTRACT_ADDRESS}:sctViewingKey`;
            let viewingKey = localStorage.getItem(storageKey);
            
            if (!viewingKey) {
                // Create a new viewing key
                viewingKey = await createSCTViewingKey();
                localStorage.setItem(storageKey, viewingKey);
                
                // Wait a moment for the viewing key to be processed
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Query the user's SCT NFTs using the viewing key
            const query = {
                tokens: {
                    owner: secretAddress,
                    viewing_key: viewingKey,
                    limit: 30  // Check up to 30 NFTs
                }
            };
            
            const response = await secretJs.query.compute.queryContract({
                contract_address: SCT_CONTRACT_ADDRESS,
                code_hash: SCT_CODE_HASH,
                query: query,
            }) as SCTTokensResponse;
            
            if (typeof response === "string") {
                throw new QueryError(response);
            }
            
            // Check if user has any SCT NFTs
            const hasTokens = response.token_list?.tokens && response.token_list.tokens.length > 0;
            console.log('SCT ownership check:', hasTokens ? 'HAS SCT' : 'NO SCT', response.token_list?.tokens?.length || 0, 'tokens');
            
            return hasTokens || false;
            
        } catch (error) {
            console.error('Failed to check SCT ownership:', error);
            
            // If viewing key error, clear it and let user try again
            if (error instanceof Error && error.message.includes("viewing key")) {
                const storageKey = `${secretAddress}:${SCT_CONTRACT_ADDRESS}:sctViewingKey`;
                localStorage.removeItem(storageKey);
            }
            
            throw error;
        }
    };

    return {
        makePoll,
        castVote,
        getPolls,
        getNumPolls,
        getMyVote,
        createSCTViewingKey,
        checkSCTOwnership,
    };
};

export { SecretJsFunctions };