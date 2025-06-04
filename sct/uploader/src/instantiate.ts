/*
instantiate.ts

This script instantiates an uploaded SCT (SNIP-721) contract on the Secret Test Network.
*/


// Import the Secret Network client and wallet classes
import { SecretNetworkClient, Wallet } from "secretjs";
import * as dotenv from "dotenv";

// Load the environment variables
dotenv.config();
const admin_mnemonic = process.env.ADMIN_MNEMONIC;
const admin_address = process.env.ADMIN_ADDRESS;
const sct_code_id = process.env.SCT_CODE_ID;
const sct_code_hash = process.env.SCT_CODE_HASH;

console.log("ADMIN_MNEMONIC: ", admin_mnemonic);
console.log("ADMIN_ADDRESS: ", admin_address);

// Create the admin wallet from the mnemonic
const admin_wallet = new Wallet(admin_mnemonic);

// Create the Secret Network client for the Pulsar testnet
const admin_client = new SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://pulsar.lcd.secretnodes.com",
    wallet: admin_wallet,
    walletAddress: admin_wallet.address,
  });


const instantiateContract = async (codeId: string, contractCodeHash: string): Promise<string> => {
    try {
        console.log("Instantiating SCT contract on Secret Network...");
        console.log(`Code ID: ${codeId}`);
        console.log(`Code hash: ${contractCodeHash}`);
        
        // Generate entropy for the contract
        const entropy = Buffer.from(Math.random().toString(36).substring(2) + Date.now().toString(36)).toString('base64');
        
        // Create instantiation message for SNIP-721
        const initMsg = {
            name: "SoulboundCredentialToken",
            symbol: "SCT",
            admin: admin_address,
            entropy: entropy,
            config: {
                public_total_supply: true,
                public_owner: false,
                enable_sealed_metadata: false,
                unwrapped_metadata_is_private: false,
                minter_may_update_metadata: true,
                owner_may_update_metadata: false,
                enable_burn: true
            }
        };
        
        // Generate a unique label for the contract instance
        const label = "SoulboundCredentialToken_" + Math.ceil(Math.random() * 10_000_000);
        console.log(`Contract label: ${label}`);
        
        // Instantiate the contract on the blockchain
        const tx = await admin_client.tx.compute.instantiateContract(
            {
                code_id: codeId,
                sender: admin_wallet.address,
                code_hash: contractCodeHash,
                init_msg: initMsg,
                label: label,
            },
            {
                gasLimit: 400_000,
            }
        );
        
        // Extract the contract address from the transaction logs
        const contractAddressLog = tx.arrayLog?.find(
            (log) => log.type === "message" && log.key === "contract_address"
        );
        
        if (!contractAddressLog) {
            throw new Error("Failed to find contract_address in transaction logs");
        }
        
        const contractAddress = contractAddressLog.value;
        console.log("Contract instantiated successfully!");
        console.log(`Contract address: ${contractAddress}`);
        console.log(`Contract label: ${label}`);
        console.log(`Contract entropy: ${entropy}`);
        
        return contractAddress;
        
    } catch (error) {
        console.error("Failed to instantiate contract:", error);
        throw error;
    }
};

export const main = async (): Promise<void> => {
    // Check that required environment variables are set
    if (!sct_code_id) {
        console.error('SCT_CODE_ID environment variable is required!');
        console.error('Update your .env file with the SCT_CODE_ID value from the upload step.');
        process.exit(1);
    }
    
    if (!sct_code_hash) {
        console.error('SCT_CODE_HASH environment variable is required!');
        console.error('Update your .env file with the SCT_CODE_HASH value from the upload step.');
        process.exit(1);
    }

    // Instantiate the contract using values from environment variables
    const contract_address = await instantiateContract(sct_code_id, sct_code_hash);
    
    // Print the contract address
    console.log("\n=== IMPORTANT: Save this value ===");
    console.log(`Contract address: ${contract_address}`);
    console.log("\nUpdate your .env file with:");
    console.log(`SCT_CONTRACT_ADDRESS="${contract_address}"`);
};

main(); 