/*
instantiate.ts

This script instantiates an uploaded polling contract on the Secret Test Network.
*/


// Import the Secret Network client and wallet classes
import { SecretNetworkClient, Wallet } from "secretjs";
import * as dotenv from "dotenv";

// Load the environment variables
dotenv.config();
const admin_mnemonic = process.env.ADMIN_MNEMONIC;
console.log("ADMIN_MNEMONIC: ", admin_mnemonic);

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
        
        // Create instantiation message (empty for this contract)
        const initMsg = {};
        
        // Generate a unique label for the contract instance
        const label = "test contract" + Math.ceil(Math.random() * 10_000_000);
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
        
        return contractAddress;
        
    } catch (error) {
        console.error("Failed to instantiate contract:", error);
        throw error;
    }
};

export const main = async (): Promise<void> => {
    // The expected command is:
    // npm run instantiate <code_id> <code_hash>
    if (process.argv.length !== 4) {
        console.error('Expected two arguments!');
        console.error('Usage: node instantiate.ts <code_id> <code_hash>');
        process.exit(1);
    }

    // Extract the code_id and code_hash from the command line arguments
    let code_id = process.argv[2];
    let code_hash = process.argv[3];

    // Instantiate the contract
    const contract_address = await instantiateContract(code_id, code_hash);
    
    // Print the contract address
    console.log("Contract address: ", contract_address);
};

main();
