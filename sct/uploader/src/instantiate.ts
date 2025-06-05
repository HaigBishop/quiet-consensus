/*
instantiate.ts

This script instantiates an uploaded SCT (SNIP-721) contract on the Secret Test Network.
*/


// Import the Secret Network client and wallet classes
import { SecretNetworkClient, Wallet } from "secretjs";
import { ADMIN_MNEMONIC, ADMIN_ADDRESS, SCT_CODE_ID, SCT_CODE_HASH } from "./config";
import { updateConfig, updatePollConfig, updateWebConfig } from "./config-updater";

console.log("ADMIN_MNEMONIC: ", ADMIN_MNEMONIC);
console.log("ADMIN_ADDRESS: ", ADMIN_ADDRESS);

// Create the admin wallet from the mnemonic
const admin_wallet = new Wallet(ADMIN_MNEMONIC);

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
            admin: ADMIN_ADDRESS,
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
    if (!SCT_CODE_ID) {
        console.error('SCT_CODE_ID is required!');
        console.error('Run npm run upload first to set the SCT_CODE_ID value.');
        process.exit(1);
    }
    
    if (!SCT_CODE_HASH) {
        console.error('SCT_CODE_HASH is required!');
        console.error('Run npm run upload first to set the SCT_CODE_HASH value.');
        process.exit(1);
    }

    // Instantiate the contract using values from config.ts
    const contract_address = await instantiateContract(SCT_CODE_ID, SCT_CODE_HASH);
    
    console.log("\n=== Contract instantiated successfully ===");
    console.log(`Contract address: ${contract_address}`);
    
    // Automatically update config.ts
    console.log("\nUpdating config.ts file...");
    updateConfig([
        { key: "SCT_CONTRACT_ADDRESS", value: contract_address }
    ]);
    
    // Also update the poll uploader config with both SCT values
    console.log("\nUpdating poll uploader config.ts file...");
    updatePollConfig([
        { key: "SCT_CODE_HASH", value: SCT_CODE_HASH },
        { key: "SCT_CONTRACT_ADDRESS", value: contract_address }
    ]);
    
    // Also update the web config with both SCT values
    console.log("\nUpdating web config.ts file...");
    updateWebConfig([
        { key: "SCT_CODE_HASH", value: SCT_CODE_HASH },
        { key: "SCT_CONTRACT_ADDRESS", value: contract_address }
    ]);
    
    console.log("\nThe config.ts files have been updated with the contract address!");
};

main(); 