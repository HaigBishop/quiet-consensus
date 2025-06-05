/*
upload.ts

This script uploads the polling contract in `poll/contract/` to the Secret Test Network.
*/


// Import the Secret Network client and wallet classes
import { SecretNetworkClient, Wallet } from "secretjs";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { validateWasm } from "./validate-wasm";

// Load the environment variables
dotenv.config();
const admin_mnemonic = process.env.ADMIN_MNEMONIC;
console.log("ADMIN_MNEMONIC: ", admin_mnemonic);

// Set the path to the contract binary
const CONTRACT_BINARY_PATH = "../contract/contract.wasm.gz";

// Create the admin wallet from the mnemonic
const admin_wallet = new Wallet(admin_mnemonic);

// Create the client for the Secret Network (Pulsar testnet)
const admin_client = new SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://pulsar.lcd.secretnodes.com",
    wallet: admin_wallet,
    walletAddress: admin_wallet.address,
  });

  

const uploadContract = async (contract_wasm: Buffer): Promise<{code_id: string, code_hash?: string}> => {
    try {
        console.log("Uploading contract to Secret Network...");
        console.log(`Contract size: ${contract_wasm.length} bytes`);
        
        // Store the contract code on the blockchain
        const tx = await admin_client.tx.compute.storeCode(
            {
                sender: admin_wallet.address,
                wasm_byte_code: contract_wasm,
                source: "",
                builder: "",
            },
            {
                gasLimit: 1_500_000,
            }
        );

        // Check if transaction failed
        if (tx.code !== 0) {
            console.error("Transaction failed with code:", tx.code);
            console.error("Error message:", tx.rawLog);
            throw new Error(`Transaction failed: ${tx.rawLog}`);
        }

        // Debug: Log the full transaction response
        console.log("Transaction response:", JSON.stringify(tx, null, 2));
        console.log("Transaction arrayLog:", JSON.stringify(tx.arrayLog, null, 2));

        // Extract the code ID from the transaction logs
        const codeIdLog = tx.arrayLog?.find(
            (log) => log.type === "message" && log.key === "code_id"
        );
        
        if (!codeIdLog) {
            // Try alternative methods to find code_id
            console.log("Looking for code_id in alternative locations...");
            
            // Check if it's in the events
            if (tx.events) {
                console.log("Transaction events:", JSON.stringify(tx.events, null, 2));
            }
            
            // Check if it's in rawLog
            if (tx.rawLog) {
                console.log("Raw log:", tx.rawLog);
            }
            
            throw new Error("Failed to find code_id in transaction logs");
        }
        
        const codeId = codeIdLog.value;
        console.log("Contract uploaded successfully!");
        console.log(`Code ID: ${codeId}`);
        
        // Query the contract hash using the code ID
        console.log("Retrieving contract hash...");
        const contractCodeHash = (
            await admin_client.query.compute.codeHashByCodeId({ code_id: codeId })
        ).code_hash;
        
        console.log(`Contract hash: ${contractCodeHash}`);
        
        return {
            code_id: codeId,
            code_hash: contractCodeHash,
        };
        
    } catch (error) {
        console.error("Failed to upload contract:", error);
        throw error;
    }
};

export const main = async (): Promise<void> => {
    // Validate WASM before uploading
    const isValid = await validateWasm();
    if (!isValid) {
        console.error("❌ WASM validation failed. Aborting upload.");
        process.exit(1);
    }
    
    // Upload the contract
    await uploadContract(fs.readFileSync(CONTRACT_BINARY_PATH));

};

main();
