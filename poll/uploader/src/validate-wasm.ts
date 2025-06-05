// WASM validation script to check if the contract binary is valid
import * as fs from "fs";
import * as zlib from "zlib";

const CONTRACT_BINARY_PATH = "../contract/contract.wasm.gz";

export const validateWasm = async (): Promise<boolean> => {
    try {
        console.log("Validating WASM file...");
        
        // Check if file exists
        if (!fs.existsSync(CONTRACT_BINARY_PATH)) {
            console.error("❌ Contract file not found:", CONTRACT_BINARY_PATH);
            return false;
        }
        
        // Read and decompress the file
        const compressedData = fs.readFileSync(CONTRACT_BINARY_PATH);
        console.log(`📦 Compressed size: ${compressedData.length} bytes`);
        
        const decompressed = zlib.gunzipSync(compressedData);
        console.log(`📂 Decompressed size: ${decompressed.length} bytes`);
        
        // Basic WASM magic number check
        const wasmMagic = new Uint8Array([0x00, 0x61, 0x73, 0x6d]); // "\0asm"
        const fileMagic = new Uint8Array(decompressed.slice(0, 4));
        
        const magicMatches = wasmMagic.every((byte, index) => byte === fileMagic[index]);
        
        if (!magicMatches) {
            console.error("❌ Invalid WASM magic number");
            console.error("Expected:", Array.from(wasmMagic).map(b => b.toString(16)).join(' '));
            console.error("Found:", Array.from(fileMagic).map(b => b.toString(16)).join(' '));
            return false;
        }
        
        // Check WASM version
        const version = new Uint8Array(decompressed.slice(4, 8));
        const expectedVersion = new Uint8Array([0x01, 0x00, 0x00, 0x00]); // version 1
        
        const versionMatches = expectedVersion.every((byte, index) => byte === version[index]);
        
        if (!versionMatches) {
            console.error("❌ Invalid WASM version");
            console.error("Expected:", Array.from(expectedVersion).map(b => b.toString(16)).join(' '));
            console.error("Found:", Array.from(version).map(b => b.toString(16)).join(' '));
            return false;
        }
        
        console.log("✅ WASM file appears to be valid");
        console.log("✅ Magic number: correct");
        console.log("✅ Version: correct");
        
        return true;
        
    } catch (error) {
        console.error("❌ Error validating WASM:", error);
        return false;
    }
};

// Run validation if called directly
if (require.main === module) {
    validateWasm().then(isValid => {
        process.exit(isValid ? 0 : 1);
    });
} 