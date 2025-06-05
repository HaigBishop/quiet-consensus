/*
upload.ts

This script uploads the SNIP-721 reference implementation to the Secret Test Network.
*/


// Import the Secret Network client and wallet classes
import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import { execSync } from "child_process";
import * as path from "path";
import { ADMIN_MNEMONIC } from "./config";
import { updateConfig, updateWebConfig } from "./config-updater";

console.log("ADMIN_MNEMONIC: ", ADMIN_MNEMONIC);

// Set the path to the contract binary
const CONTRACT_BINARY_PATH = "../contract/snip721_reference.wasm.gz";

// Create the contract directory if it doesn't exist
const contractDir = path.join(__dirname, "../../contract");
if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, { recursive: true });
}

// Create the admin wallet from the mnemonic
const admin_wallet = new Wallet(ADMIN_MNEMONIC);

// Create the client for the Secret Network (Pulsar testnet)
const admin_client = new SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://pulsar.lcd.secretnodes.com",
    wallet: admin_wallet,
    walletAddress: admin_wallet.address,
  });


const downloadContract = async (): Promise<void> => {
    console.log("Downloading SNIP-721 reference implementation...");
    
    // Create contract directory if it doesn't exist
    const contractDir = path.join(__dirname, "../../contract");
    if (!fs.existsSync(contractDir)) {
        fs.mkdirSync(contractDir, { recursive: true });
    }
    
    // Clone and build the SNIP-721 reference implementation
    const tempDir = path.join(contractDir, "temp_build");
    
    try {
        // Clean up any existing temp directory using Docker if it exists
        if (fs.existsSync(tempDir)) {
            console.log("Cleaning up existing temp directory...");
            try {
                // Try to use Docker to clean up files with proper permissions
                execSync(`docker run --rm -v "${tempDir}:/temp" busybox rm -rf /temp/*`, {
                    stdio: 'pipe'
                });
                // Remove the now-empty directory
                execSync(`rmdir "${tempDir}"`, { stdio: 'pipe' });
            } catch (cleanupError) {
                console.log("Docker cleanup failed, trying sudo...");
                try {
                    execSync(`sudo rm -rf ${tempDir}`, { stdio: 'pipe' });
                } catch (sudoError) {
                    console.log("Sudo cleanup failed, proceeding anyway...");
                    // If cleanup fails, we'll create a new temp directory with a timestamp
                    const timestamp = Date.now();
                    const newTempDir = path.join(contractDir, `temp_build_${timestamp}`);
                    console.log(`Using alternative temp directory: ${newTempDir}`);
                    return downloadContractWithTempDir(newTempDir, contractDir);
                }
            }
        }
        
        return downloadContractWithTempDir(tempDir, contractDir);
        
    } catch (error) {
        console.error("Failed to download and build contract:", error);
        throw error;
    }
};

const downloadContractWithTempDir = async (tempDir: string, contractDir: string): Promise<void> => {
    try {
        // Clone the repository
        console.log("Cloning SNIP-721 reference implementation...");
        execSync(`git clone https://github.com/baedrik/snip721-reference-impl.git ${tempDir}`, {
            stdio: 'inherit'
        });
        
        // Build the contract
        console.log("Building contract (this may take a few minutes)...");
        execSync("make compile-optimized-reproducible", {
            cwd: tempDir,
            stdio: 'inherit'
        });
        
        // Copy the built contract to the contract directory
        const sourcePath = path.join(tempDir, "contract.wasm.gz");
        const destPath = path.join(contractDir, "snip721_reference.wasm.gz");
        fs.copyFileSync(sourcePath, destPath);
        
        console.log(`Contract built and saved to: ${destPath}`);
        
        // Clean up temp directory using Docker (to handle permission issues)
        console.log("Cleaning up build files...");
        try {
            // Use Docker to clean up the files it created
            execSync(`docker run --rm -v "${tempDir}:/temp" busybox rm -rf /temp/*`, {
                stdio: 'pipe'
            });
            // Remove the now-empty directory
            execSync(`rmdir "${tempDir}"`, { stdio: 'pipe' });
            console.log("✓ Cleanup completed successfully");
        } catch (cleanupError) {
            console.log("Cleanup failed (this is not critical - the contract was built successfully)");
            console.log("You may need to manually remove:", tempDir);
            console.log("You can use: sudo rm -rf", tempDir);
        }
        
    } catch (error) {
        console.error("Failed in downloadContractWithTempDir:", error);
        throw error;
    }
};

  

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
                gasLimit: 3_000_000,
            }
        );

        // Extract the code ID from the transaction logs
        const codeIdLog = tx.arrayLog?.find(
            (log) => log.type === "message" && log.key === "code_id"
        );
        
        if (!codeIdLog) {
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
    // Check if contract binary exists, if not download and build it
    if (!fs.existsSync(CONTRACT_BINARY_PATH)) {
        await downloadContract();
    }
    
    // Upload the contract
    const result = await uploadContract(fs.readFileSync(CONTRACT_BINARY_PATH));
    
    console.log("\n=== Contract uploaded successfully ===");
    console.log(`Code ID: ${result.code_id}`);
    console.log(`Code Hash: ${result.code_hash}`);
    
    // Automatically update config.ts
    console.log("\nUpdating config.ts file...");
    updateConfig([
        { key: "SCT_CODE_ID", value: result.code_id },
        { key: "SCT_CODE_HASH", value: result.code_hash! }
    ]);
    
    // Also update the web config with SCT code hash
    console.log("\nUpdating web config.ts file...");
    updateWebConfig([
        { key: "SCT_CODE_HASH", value: result.code_hash! }
    ]);
    
    console.log("\nThe config.ts has been updated with the new values!");
};

main(); 