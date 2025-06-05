"use strict";
/*
upload.ts

This script uploads the polling contract in `poll/contract/` to the Secret Test Network.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
// Import the Secret Network client and wallet classes
const secretjs_1 = require("secretjs");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const validate_wasm_1 = require("./validate-wasm");
// Load the environment variables
dotenv.config();
const admin_mnemonic = process.env.ADMIN_MNEMONIC;
console.log("ADMIN_MNEMONIC: ", admin_mnemonic);
// Set the path to the contract binary
const CONTRACT_BINARY_PATH = "../contract/contract.wasm.gz";
// Create the admin wallet from the mnemonic
const admin_wallet = new secretjs_1.Wallet(admin_mnemonic);
// Create the client for the Secret Network (Pulsar testnet)
const admin_client = new secretjs_1.SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://pulsar.lcd.secretnodes.com",
    wallet: admin_wallet,
    walletAddress: admin_wallet.address,
});
const uploadContract = async (contract_wasm) => {
    try {
        console.log("Uploading contract to Secret Network...");
        console.log(`Contract size: ${contract_wasm.length} bytes`);
        // Store the contract code on the blockchain
        const tx = await admin_client.tx.compute.storeCode({
            sender: admin_wallet.address,
            wasm_byte_code: contract_wasm,
            source: "",
            builder: "",
        }, {
            gasLimit: 1_500_000,
        });
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
        const codeIdLog = tx.arrayLog?.find((log) => log.type === "message" && log.key === "code_id");
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
        const contractCodeHash = (await admin_client.query.compute.codeHashByCodeId({ code_id: codeId })).code_hash;
        console.log(`Contract hash: ${contractCodeHash}`);
        return {
            code_id: codeId,
            code_hash: contractCodeHash,
        };
    }
    catch (error) {
        console.error("Failed to upload contract:", error);
        throw error;
    }
};
const main = async () => {
    // Validate WASM before uploading
    const isValid = await (0, validate_wasm_1.validateWasm)();
    if (!isValid) {
        console.error("❌ WASM validation failed. Aborting upload.");
        process.exit(1);
    }
    // Upload the contract
    await uploadContract(fs.readFileSync(CONTRACT_BINARY_PATH));
};
exports.main = main;
(0, exports.main)();
//# sourceMappingURL=upload.js.map