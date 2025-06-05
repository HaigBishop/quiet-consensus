/*
config-updater.ts

Utility functions to automatically update the config.ts file with new values.
*/

import * as fs from "fs";
import * as path from "path";

const CONFIG_FILE_PATH = path.join(__dirname, "../src/config.ts");

export interface ConfigUpdate {
    key: string;
    value: string;
}

export const updateConfig = (updates: ConfigUpdate[]): void => {
    updateConfigFile(CONFIG_FILE_PATH, updates, "config.ts");
};

export const updateConfigFile = (filePath: string, updates: ConfigUpdate[], displayName: string): void => {
    try {
        // Read the current config file
        let configContent = fs.readFileSync(filePath, "utf8");
        
        for (const update of updates) {
            const { key, value } = update;
            const exportPattern = new RegExp(`^export const ${key} = .*$`, "m");
            const newLine = `export const ${key} = "${value}";`;
            
            if (exportPattern.test(configContent)) {
                // Replace existing export
                configContent = configContent.replace(exportPattern, newLine);
                console.log(`✓ Updated ${key} in ${displayName}`);
            } else {
                // Add new export at the end of the file
                if (!configContent.endsWith('\n')) {
                    configContent += '\n';
                }
                configContent += `${newLine}\n`;
                console.log(`✓ Added ${key} to ${displayName}`);
            }
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, configContent);
        console.log(`✓ ${displayName} updated successfully`);
        
    } catch (error) {
        console.error(`Failed to update ${displayName}:`, error);
        throw error;
    }
};

export const updateWebConfig = (contractAddress: string, codeHash: string): void => {
    const webConfigPath = path.join(__dirname, "../../../web/src/config.ts");
    
    try {
        // Check if web config file exists
        if (!fs.existsSync(webConfigPath)) {
            console.log("⚠️  Web config file not found, creating it...");
            const initialContent = `/*
Configuration for Secret Network contract addresses and code hashes.
These values should match what's deployed on the testnet.
*/

export const POLLING_CONTRACT_CODE_HASH = "${codeHash}";
export const POLLING_CONTRACT_ADDRESS = "${contractAddress}";
`;
            fs.writeFileSync(webConfigPath, initialContent);
            console.log("✓ Created web/src/config.ts");
            return;
        }
        
        // Update existing file using the generic function
        const updates = [
            { key: "POLLING_CONTRACT_CODE_HASH", value: codeHash },
            { key: "POLLING_CONTRACT_ADDRESS", value: contractAddress }
        ];
        
        updateConfigFile(webConfigPath, updates, "web/src/config.ts");
        
    } catch (error) {
        console.log("⚠️  Could not update web/src/config.ts automatically:", error);
        console.log("Please manually update web/src/config.ts with:");
        console.log(`  POLLING_CONTRACT_CODE_HASH="${codeHash}"`);
        console.log(`  POLLING_CONTRACT_ADDRESS="${contractAddress}"`);
    }
}; 