"use strict";
/*
instantiate.ts

This script instantiates an uploaded polling contract on the Secret Test Network.
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
// Load the environment variables
dotenv.config();
const admin_mnemonic = process.env.ADMIN_MNEMONIC;
console.log("ADMIN_MNEMONIC: ", admin_mnemonic);
// Create the admin wallet from the mnemonic
const admin_wallet = new secretjs_1.Wallet(admin_mnemonic);
// Create the Secret Network client for the Pulsar testnet
const admin_client = new secretjs_1.SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://pulsar.lcd.secretnodes.com",
    wallet: admin_wallet,
    walletAddress: admin_wallet.address,
});
const instantiateContract = async (codeId, contractCodeHash) => {
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
        const tx = await admin_client.tx.compute.instantiateContract({
            code_id: codeId,
            sender: admin_wallet.address,
            code_hash: contractCodeHash,
            init_msg: initMsg,
            label: label,
        }, {
            gasLimit: 400_000,
        });
        // Extract the contract address from the transaction logs
        const contractAddressLog = tx.arrayLog?.find((log) => log.type === "message" && log.key === "contract_address");
        if (!contractAddressLog) {
            throw new Error("Failed to find contract_address in transaction logs");
        }
        const contractAddress = contractAddressLog.value;
        console.log("Contract instantiated successfully!");
        console.log(`Contract address: ${contractAddress}`);
        return contractAddress;
    }
    catch (error) {
        console.error("Failed to instantiate contract:", error);
        throw error;
    }
};
const main = async () => {
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
exports.main = main;
(0, exports.main)();
//# sourceMappingURL=instantiate.js.map