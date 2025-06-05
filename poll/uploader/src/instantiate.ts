/*
instantiate.ts

This script instantiates an uploaded polling contract on the Secret Test Network.
*/


// Import the Secret Network client and wallet classes
import { SecretNetworkClient, Wallet } from "secretjs";
import { 
    ADMIN_MNEMONIC,
    POLLING_CONTRACT_CODE_ID,
    POLLING_CONTRACT_CODE_HASH,
    SCT_CONTRACT_ADDRESS,
    SCT_CODE_HASH
} from "./config";
import { updateWebConfig } from "./config-updater";

// Load the configuration
const admin_mnemonic = ADMIN_MNEMONIC;
const code_id = POLLING_CONTRACT_CODE_ID;
const code_hash = POLLING_CONTRACT_CODE_HASH;
const sct_contract_address = SCT_CONTRACT_ADDRESS;
const sct_code_hash = SCT_CODE_HASH;

console.log("ADMIN_MNEMONIC: ", admin_mnemonic);
console.log("POLLING_CONTRACT_CODE_ID: ", code_id);
console.log("POLLING_CONTRACT_CODE_HASH: ", code_hash);
console.log("SCT_CONTRACT_ADDRESS: ", sct_contract_address);
console.log("SCT_CODE_HASH: ", sct_code_hash);

// Validate required configuration values
if (!admin_mnemonic) {
    console.error("Error: ADMIN_MNEMONIC is required in config.ts file");
    process.exit(1);
}

if (!code_id) {
    console.error("Error: POLLING_CONTRACT_CODE_ID is required in config.ts file");
    process.exit(1);
}

if (!code_hash) {
    console.error("Error: POLLING_CONTRACT_CODE_HASH is required in config.ts file");
    process.exit(1);
}

if (!sct_contract_address) {
    console.error("Error: SCT_CONTRACT_ADDRESS is required in config.ts file");
    console.error("You need to deploy an SCT contract first. See: ../sct/creating_the_sct_contract.md");
    process.exit(1);
}

if (!sct_code_hash) {
    console.error("Error: SCT_CODE_HASH is required in config.ts file");
    console.error("You need to deploy an SCT contract first. See: ../sct/creating_the_sct_contract.md");
    process.exit(1);
}

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
        console.log("Instantiating contract on Secret Network...");
        console.log(`Code ID: ${codeId}`);
        console.log(`Code hash: ${contractCodeHash}`);
        
        // Create instantiation message with SCT contract details
        const initMsg = {
            sct_contract_address: sct_contract_address,
            sct_code_hash: sct_code_hash
        };
        
        // Generate a unique label for the contract instance
        const label = "QuietConsensusPollingContract_" + Math.ceil(Math.random() * 10_000_000);
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
        
        // Check if transaction was successful
        if (tx.code !== 0) {
            throw new Error(`Transaction failed with code ${tx.code}: ${tx.rawLog}`);
        }
        
        // Extract the contract address from the transaction logs
        // Try multiple possible log structures
        let contractAddressLog = tx.arrayLog?.find(
            (log) => log.type === "message" && log.key === "contract_address"
        );
        
        // Alternative: look for wasm events
        if (!contractAddressLog) {
            contractAddressLog = tx.arrayLog?.find(
                (log) => log.type === "wasm" && log.key === "contract_address"
            );
        }
        
        // Alternative: look for instantiate events
        if (!contractAddressLog) {
            contractAddressLog = tx.arrayLog?.find(
                (log) => log.type === "instantiate" && log.key === "contract_address"
            );
        }
        
        // Alternative: look for any log with contract_address key
        if (!contractAddressLog) {
            contractAddressLog = tx.arrayLog?.find(
                (log) => log.key === "contract_address"
            );
        }
        
        if (!contractAddressLog) {
            throw new Error("Failed to find contract_address in transaction logs");
        }
        
        const contractAddress = contractAddressLog.value;
        console.log("Contract instantiated successfully!");
        console.log(`Contract address: ${contractAddress}`);
        
        return contractAddress;
        
    } catch (error) {
        console.error("Failed to instantiate contract:", error);
        throw error;
    }
};

export const main = async (): Promise<void> => {
    // Instantiate the contract using values from environment variables
    const contract_address = await instantiateContract(code_id!, code_hash!);
    
    // Automatically update web config file
    updateWebConfig(contract_address, code_hash!);
    
    console.log("\n=== Contract Instantiation Complete ===");
    console.log(`✓ Contract address: ${contract_address}`);
    console.log("✓ The web/src/config.ts has been updated with:");
    console.log(`  POLLING_CONTRACT_ADDRESS="${contract_address}"`);
    console.log(`  POLLING_CONTRACT_CODE_HASH="${code_hash}"`);
};

main();
