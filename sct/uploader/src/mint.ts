/*
mint.ts

This script mints non-transferable SCT NFTs to user accounts on the Secret Test Network.
*/


// Import the Secret Network client and wallet classes
import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import path from "path";
import { 
    ADMIN_MNEMONIC, 
    SCT_CONTRACT_ADDRESS, 
    SCT_CODE_HASH,
    USER1_ADDRESS,
    USER1_MNEMONIC,
    USER2_ADDRESS,
    USER2_MNEMONIC,
    USER3_ADDRESS,
    USER3_MNEMONIC
} from "./config";
import { updateConfig } from "./config-updater";

console.log("ADMIN_MNEMONIC: ", ADMIN_MNEMONIC);
console.log("SCT_CONTRACT_ADDRESS: ", SCT_CONTRACT_ADDRESS);
console.log("SCT_CODE_HASH: ", SCT_CODE_HASH);

// Create the admin wallet from the mnemonic
const admin_wallet = new Wallet(ADMIN_MNEMONIC);

// Create the client for the Secret Network (Pulsar testnet)
const admin_client = new SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://pulsar.lcd.secretnodes.com",
    wallet: admin_wallet,
    walletAddress: admin_wallet.address,
  });


const mintNFT = async (ownerAddress: string, userName: string): Promise<void> => {
    try {
        console.log(`\nMinting SCT NFT to ${userName}...`);
        console.log(`Owner address: ${ownerAddress}`);
        
        // Create the mint message
        const mintMsg = {
            mint_nft: {
                token_id: `sct-${Date.now()}`, 
                owner: ownerAddress,
                transferable: false,  // Make it non-transferable (soulbound)
                token_uri: null
            }
        };
        
        // Execute the mint transaction
        const tx = await admin_client.tx.compute.executeContract(
            {
                sender: admin_wallet.address,
                contract_address: SCT_CONTRACT_ADDRESS,
                code_hash: SCT_CODE_HASH,
                msg: mintMsg,
            },
            {
                gasLimit: 200_000,
            }
        );
        
        // Check if transaction was successful
        if (tx.code !== 0) {
            throw new Error(`Transaction failed with code ${tx.code}: ${tx.rawLog}`);
        }
        
        console.log(`✓ Successfully minted SCT NFT to ${userName}`);
        console.log(`  Transaction hash: ${tx.transactionHash}`);

        // Write tx to file
        const logDir = path.join(__dirname, "logs");
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        // Extract user number from userName (e.g., "Quiet Consensus User 1" -> "1")
        const userNumber = userName.match(/User (\d+)/)?.[1] || "unknown";
        const filename = `mint_tx_user_${userNumber}.json`;
        
        fs.writeFileSync(path.join(logDir, filename), JSON.stringify(tx, null, 2));
        console.log(`Transaction log written to logs/${filename}`);
        
    } catch (error) {
        console.error(`Failed to mint NFT to ${userName}:`, error);
        throw error;
    }
};

const createViewingKey = async (userWallet: Wallet, userClient: SecretNetworkClient, userName: string): Promise<string> => {
    try {
        console.log(`\nCreating viewing key for ${userName}...`);
        
        // Generate a random viewing key
        const viewingKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Create the set viewing key message
        const setViewingKeyMsg = {
            set_viewing_key: {
                key: viewingKey
            }
        };
        
        // Execute the set viewing key transaction
        const tx = await userClient.tx.compute.executeContract(
            {
                sender: userWallet.address,
                contract_address: SCT_CONTRACT_ADDRESS,
                code_hash: SCT_CODE_HASH,
                msg: setViewingKeyMsg,
            },
            {
                gasLimit: 100_000,
            }
        );
        
        // Check if transaction was successful
        if (tx.code !== 0) {
            throw new Error(`Set viewing key failed with code ${tx.code}: ${tx.rawLog}`);
        }
        
        console.log(`✓ Viewing key created for ${userName}`);
        console.log(`  Viewing key: ${viewingKey}`);
        console.log(`  Transaction hash: ${tx.transactionHash}`);
        
        return viewingKey;
        
    } catch (error) {
        console.error(`Failed to create viewing key for ${userName}:`, error);
        throw error;
    }
};

const checkNFTOwnership = async (userAddress: string, viewingKey: string, userName: string): Promise<void> => {
    try {
        console.log(`\nChecking NFT ownership for ${userName}...`);
        
        // Query the user's NFTs using the viewing key
        const query = {
            tokens: {
                owner: userAddress,
                viewing_key: viewingKey,
                limit: 30  // Check up to 30 NFTs
            }
        };
        
        const response = await admin_client.query.compute.queryContract({
            contract_address: SCT_CONTRACT_ADDRESS,
            code_hash: SCT_CODE_HASH,
            query: query,
        });
        
        console.log(`✓ NFT ownership query successful for ${userName}`);
        // console.log(`  Raw response:`, JSON.stringify(response, null, 2));
        
        // Type the response properly - the tokens are nested under token_list
        const typedResponse = response as { token_list?: { tokens?: string[] } };
        
        if (typedResponse.token_list?.tokens && typedResponse.token_list.tokens.length > 0) {
            console.log(`  ${userName} owns ${typedResponse.token_list.tokens.length} SCT NFT(s)`);
            console.log(`  Token IDs: ${typedResponse.token_list.tokens.join(', ')}`);
            
            // Save the ownership info to a file
            const logDir = path.join(__dirname, "logs");
            const ownershipData = {
                user: userName,
                address: userAddress,
                viewing_key: viewingKey,
                nft_count: typedResponse.token_list.tokens.length,
                token_ids: typedResponse.token_list.tokens,
                query_time: new Date().toISOString()
            };
            
            // Extract user number from userName (e.g., "Quiet Consensus User 1" -> "1")
            const userNumber = userName.match(/User (\d+)/)?.[1] || "unknown";
            const filename = `ownership_tx_user_${userNumber}.json`;
            
            fs.writeFileSync(
                path.join(logDir, filename), 
                JSON.stringify(ownershipData, null, 2)
            );
            console.log(`  Ownership info saved to logs/${filename}`);
        } else {
            console.log(` ⚠️   ${userName} does not own any SCT NFTs`);
            console.log(`  Query sent:`, JSON.stringify(query, null, 2));
            console.log(`  Raw response:`, JSON.stringify(response, null, 2));
        }
        
    } catch (error) {
        console.error(`Failed to check NFT ownership for ${userName}:`, error);
        // Don't throw here - we want to continue checking other users
    }
};

export const main = async (): Promise<void> => {
    // Check if required configuration values are set
    if (!SCT_CONTRACT_ADDRESS || !SCT_CODE_HASH) {
        console.error("Error: SCT_CONTRACT_ADDRESS and SCT_CODE_HASH must be set in config.ts file");
        console.error("Please run 'npm run upload' and 'npm run instantiate' first");
        process.exit(1);
    }
    
    if (!USER1_ADDRESS || !USER2_ADDRESS || !USER3_ADDRESS) {
        console.error("Error: User addresses must be set in config.ts file");
        process.exit(1);
    }

    if (!USER1_MNEMONIC || !USER2_MNEMONIC || !USER3_MNEMONIC) {
        console.error("Error: User mnemonics must be set in config.ts file");
        process.exit(1);
    }
    
    console.log("Starting SCT NFT minting process...");
    console.log("================================");
    
    try {
        // Mint NFTs to all three users
        await mintNFT(USER1_ADDRESS, "Quiet Consensus User 1");
        await mintNFT(USER2_ADDRESS, "Quiet Consensus User 2");
        await mintNFT(USER3_ADDRESS, "Quiet Consensus User 3");
        
        console.log("\nAll SCT NFTs minted successfully!");
        console.log("\nEach user now has a non-transferable (soulbound) SCT NFT.");
        console.log("These NFTs prove humanity and group membership for voting on polls.");
        
        // Now create viewing keys and verify ownership
        console.log("\n\n=== Creating Viewing Keys and Verifying Ownership ===");
        
        // Create user wallets and clients
        const user1_wallet = new Wallet(USER1_MNEMONIC);
        const user1_client = new SecretNetworkClient({
            chainId: "pulsar-3",
            url: "https://pulsar.lcd.secretnodes.com",
            wallet: user1_wallet,
            walletAddress: user1_wallet.address,
        });
        
        const user2_wallet = new Wallet(USER2_MNEMONIC);
        const user2_client = new SecretNetworkClient({
            chainId: "pulsar-3",
            url: "https://pulsar.lcd.secretnodes.com",
            wallet: user2_wallet,
            walletAddress: user2_wallet.address,
        });
        
        const user3_wallet = new Wallet(USER3_MNEMONIC);
        const user3_client = new SecretNetworkClient({
            chainId: "pulsar-3",
            url: "https://pulsar.lcd.secretnodes.com",
            wallet: user3_wallet,
            walletAddress: user3_wallet.address,
        });
        
        // Create viewing keys for each user
        const user1_viewing_key = await createViewingKey(user1_wallet, user1_client, "Quiet Consensus User 1");
        const user2_viewing_key = await createViewingKey(user2_wallet, user2_client, "Quiet Consensus User 2");
        const user3_viewing_key = await createViewingKey(user3_wallet, user3_client, "Quiet Consensus User 3");
        
        // Wait a moment for the viewing keys to be set
        console.log("\nWaiting 10 seconds for viewing keys to be processed...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Check NFT ownership for each user
        await checkNFTOwnership(USER1_ADDRESS, user1_viewing_key, "Quiet Consensus User 1");
        await checkNFTOwnership(USER2_ADDRESS, user2_viewing_key, "Quiet Consensus User 2");
        await checkNFTOwnership(USER3_ADDRESS, user3_viewing_key, "Quiet Consensus User 3");
        
        console.log("\nSCT minting and verification process completed!");
        console.log("\n=== Viewing Keys ===");
        console.log(`User 1 viewing key: ${user1_viewing_key}`);
        console.log(`User 2 viewing key: ${user2_viewing_key}`);
        console.log(`User 3 viewing key: ${user3_viewing_key}`);
        console.log("\nAll transaction logs and ownership info saved to logs/ directory");
        
        // Automatically update config.ts with viewing keys
        console.log("\nUpdating config.ts with viewing keys...");
        updateConfig([
            { key: "USER1_VIEWING_KEY", value: user1_viewing_key },
            { key: "USER2_VIEWING_KEY", value: user2_viewing_key },
            { key: "USER3_VIEWING_KEY", value: user3_viewing_key }
        ]);
        
        console.log("\nThe config.ts has been updated with the viewing keys!");
        
    } catch (error) {
        console.error("\nMinting process failed:", error);
        process.exit(1);
    }
};

main(); 
