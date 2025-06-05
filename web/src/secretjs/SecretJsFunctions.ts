/*

[OLD NEED TO REPLACE MOST OF THIS]

Secret Network smart contract interaction functions.
Provides hooks for executing auction contracts and querying auction data with permit-based authentication.
*/

import { useContext } from "react";
import { SECRET_CHAIN_ID, SecretJsContext } from "./SecretJsContext";
import { QueryError, WalletError } from "./SecretJsErrors";
import type { Permit } from "secretjs";

const contractCodeHash = import.meta.env.POLLING_CONTRACT_CODE_HASH;
const contractAddress = import.meta.env.POLLING_CONTRACT_ADDRESS;

type AuctionInfo = {
    auction_info: {
        started: boolean,
        minimum_bid?: string,
        end_time?: string,
    }
};

type AuctionInfoResponse = AuctionInfo | string;

type GetSecret = {
    get_secret: {
        secret: string,
    }
}

type GetSecretResponse = GetSecret | string;

const SecretJsFunctions = () => {
    const context = useContext(SecretJsContext);

    if (!context) {
        throw new Error("SecretJsFunctions must be used within a SecretjsContextProvider");
    }

    const { secretJs, secretAddress } = context;

    // executes `set_auction` on the contract
    const set_auction = async (
        secret: string,
        minimum_bid: bigint,
        seconds: number,
    ): Promise<void> => {
        if (!secretJs || !secretAddress) throw(new WalletError("no wallet connected"));

        console.log(secretJs);
        const setAuctionMsg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                set_auction: {
                    secret,
                    minimum_bid: minimum_bid.toString(),
                    end_time: Math.floor((Date.now() + (seconds * 1000)) / 1000).toString()
                }
            }
        };

        console.log(setAuctionMsg);
        const tx = await secretJs.tx.compute.executeContract(
            setAuctionMsg,
            {
                gasLimit: 50_000,
            }
        );

        console.log(tx);
    }

    // executes `start_auction` on the contract
    const start_auction = async ( ): Promise<void> => {
        if (!secretJs || !secretAddress) throw(new WalletError("no wallet connected"));

        const startAuctionMsg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                start_auction: { }
            }
        };

        const tx = await secretJs.tx.compute.executeContract(
            startAuctionMsg,
            {
                gasLimit: 50_000,
            }
        );

        console.log(tx);
    }

    // executes `bid` on the contract
    const bid = async ( amount: bigint ): Promise<void> => {
        if (!secretJs || !secretAddress) throw(new WalletError("no wallet connected"));

        const bidMsg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                bid: { }
            },
            sent_funds: [
                {
                    denom: "uscrt",
                    amount: amount.toString(),
                }
            ]
        };

        const tx = await secretJs.tx.compute.executeContract(
            bidMsg,
            {
                gasLimit: 50_000,
            }
        );

        console.log(tx);
    }

    // executes `withdraw` on the contract
    const withraw = async ( ): Promise<void> => {
        if (!secretJs || !secretAddress) throw(new WalletError("no wallet connected"));

        const withdrawMsg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                withdraw: { }
            },
        };

        const tx = await secretJs.tx.compute.executeContract(
            withdrawMsg,
            {
                gasLimit: 50_000,
            }
        );

        console.log(tx);
    }

    // queries `auction_info` on the contract
    const query_auction_info = async (): Promise<AuctionInfo> => {
        if (!secretJs) throw(new WalletError("no wallet connected"));

        const auctionInfoMsg = {
            contract_address: contractAddress,
            query: {
                auction_info: {},
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(auctionInfoMsg) as AuctionInfoResponse;

        console.log(result);

        if (typeof result === "string") {
            throw(new QueryError(result));
        }

        return result;
    };

    // queries `get_secret` on the contract
    const query_get_secret = async (): Promise<GetSecret> => {
        if (!secretJs) throw(new WalletError("no wallet connected"));

        const permit = await getPermit();

        const getSecretMsg = {
            contract_address: contractAddress,
            query: {
                with_permit: {
                    permit,
                    query: {
                        get_secret: { }
                    }
                }
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(getSecretMsg) as GetSecretResponse;

        if (typeof result === "string") {
            throw(new QueryError(result));
        }

        return result;
    }

    // permit storage key
    const storageKey = `${secretAddress}:${contractAddress}:queryPermit}`;

    // helper function to create query permit. caches in localstorage
    const getPermit = async (): Promise<Permit> => {
        if (!secretJs) throw(new WalletError("no wallet connected"));

        const queryPermitStored = localStorage.getItem(storageKey);

        let permit: Permit;
        if (queryPermitStored) {
            permit = JSON.parse(queryPermitStored);
        } else {
            permit = await secretJs.utils.accessControl.permit.sign(
                secretAddress,
                SECRET_CHAIN_ID,
                "Auction query permit",
                [contractAddress],
                ["owner"],
                true
            );
            localStorage.setItem(storageKey, JSON.stringify(permit));
        }

        return permit;
    }


    return {
        set_auction,
        start_auction,
        bid,
        withraw,
        query_auction_info,
        query_get_secret,
    };
};

export { SecretJsFunctions };