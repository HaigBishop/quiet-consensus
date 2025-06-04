/*
mint.ts

This script mints non-transferable SCT NFTs to user accounts on the Secret Test Network.
*/


// Import the Secret Network client and wallet classes
import { SecretNetworkClient, Wallet } from "secretjs";
import * as dotenv from "dotenv";
import * as fs from "fs";
import path from "path";

// Load the environment variables
dotenv.config();
const admin_mnemonic = process.env.ADMIN_MNEMONIC;
const sct_contract_address = process.env.SCT_CONTRACT_ADDRESS;
const sct_code_hash = process.env.SCT_CODE_HASH;

// User addresses and mnemonics from environment
const user1_address = process.env.USER1_ADDRESS;
const user1_mnemonic = process.env.USER1_MNEMONIC;
const user2_address = process.env.USER2_ADDRESS;
const user2_mnemonic = process.env.USER2_MNEMONIC;
const user3_address = process.env.USER3_ADDRESS;
const user3_mnemonic = process.env.USER3_MNEMONIC;

console.log("ADMIN_MNEMONIC: ", admin_mnemonic);
console.log("SCT_CONTRACT_ADDRESS: ", sct_contract_address);
console.log("SCT_CODE_HASH: ", sct_code_hash);

// Create the admin wallet from the mnemonic
const admin_wallet = new Wallet(admin_mnemonic);

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
                contract_address: sct_contract_address!,
                code_hash: sct_code_hash!,
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
                contract_address: sct_contract_address!,
                code_hash: sct_code_hash!,
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
            contract_address: sct_contract_address!,
            code_hash: sct_code_hash!,
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
    // Check if required environment variables are set
    if (!sct_contract_address || !sct_code_hash) {
        console.error("Error: SCT_CONTRACT_ADDRESS and SCT_CODE_HASH must be set in .env file");
        console.error("Please run 'npm run upload' and 'npm run instantiate' first");
        process.exit(1);
    }
    
    if (!user1_address || !user2_address || !user3_address) {
        console.error("Error: User addresses must be set in .env file");
        process.exit(1);
    }

    if (!user1_mnemonic || !user2_mnemonic || !user3_mnemonic) {
        console.error("Error: User mnemonics must be set in .env file");
        process.exit(1);
    }
    
    console.log("Starting SCT NFT minting process...");
    console.log("================================");
    
    try {
        // Mint NFTs to all three users
        await mintNFT(user1_address, "Quiet Consensus User 1");
        await mintNFT(user2_address, "Quiet Consensus User 2");
        await mintNFT(user3_address, "Quiet Consensus User 3");
        
        console.log("\nAll SCT NFTs minted successfully!");
        console.log("\nEach user now has a non-transferable (soulbound) SCT NFT.");
        console.log("These NFTs prove humanity and group membership for voting on polls.");
        
        // Now create viewing keys and verify ownership
        console.log("\n\n=== Creating Viewing Keys and Verifying Ownership ===");
        
        // Create user wallets and clients
        const user1_wallet = new Wallet(user1_mnemonic);
        const user1_client = new SecretNetworkClient({
            chainId: "pulsar-3",
            url: "https://pulsar.lcd.secretnodes.com",
            wallet: user1_wallet,
            walletAddress: user1_wallet.address,
        });
        
        const user2_wallet = new Wallet(user2_mnemonic);
        const user2_client = new SecretNetworkClient({
            chainId: "pulsar-3",
            url: "https://pulsar.lcd.secretnodes.com",
            wallet: user2_wallet,
            walletAddress: user2_wallet.address,
        });
        
        const user3_wallet = new Wallet(user3_mnemonic);
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
        await checkNFTOwnership(user1_address, user1_viewing_key, "Quiet Consensus User 1");
        await checkNFTOwnership(user2_address, user2_viewing_key, "Quiet Consensus User 2");
        await checkNFTOwnership(user3_address, user3_viewing_key, "Quiet Consensus User 3");
        
        console.log("\nSCT minting and verification process completed!");
        console.log("\n=== Viewing Keys ===");
        console.log(`User 1 viewing key: ${user1_viewing_key}`);
        console.log(`User 2 viewing key: ${user2_viewing_key}`);
        console.log(`User 3 viewing key: ${user3_viewing_key}`);
        console.log("\nAll transaction logs and ownership info saved to logs/ directory");
        
    } catch (error) {
        console.error("\nMinting process failed:", error);
        process.exit(1);
    }
};

main(); 
