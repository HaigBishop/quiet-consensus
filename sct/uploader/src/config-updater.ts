/*
config-updater.ts

Utility functions to automatically update the config.ts file with new values.
*/

import * as fs from "fs";
import * as path from "path";

const CONFIG_FILE_PATH = path.join(__dirname, "../src/config.ts");
const POLL_CONFIG_FILE_PATH = path.join(__dirname, "../../../poll/uploader/src/config.ts");
const WEB_CONFIG_FILE_PATH = path.join(__dirname, "../../../web/src/config.ts");

export interface ConfigUpdate {
    key: string;
    value: string;
}

export const updateConfig = (updates: ConfigUpdate[]): void => {
    try {
        // Read the current config file
        let configContent = fs.readFileSync(CONFIG_FILE_PATH, "utf8");
        
        for (const update of updates) {
            const { key, value } = update;
            const exportPattern = new RegExp(`^export const ${key} = .*$`, "m");
            const newLine = `export const ${key} = "${value}";`;
            
            if (exportPattern.test(configContent)) {
                // Replace existing export
                configContent = configContent.replace(exportPattern, newLine);
                console.log(`✓ Updated ${key} in config.ts`);
            } else {
                // Add new export at the end of the file
                if (!configContent.endsWith('\n')) {
                    configContent += '\n';
                }
                configContent += `${newLine}\n`;
                console.log(`✓ Added ${key} to config.ts`);
            }
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(CONFIG_FILE_PATH, configContent);
        console.log("✓ Config file updated successfully");
        
    } catch (error) {
        console.error("Failed to update config file:", error);
        throw error;
    }
};

export const updatePollConfig = (updates: ConfigUpdate[]): void => {
    try {
        // Check if poll config file exists
        if (!fs.existsSync(POLL_CONFIG_FILE_PATH)) {
            console.log("Poll config file not found, skipping update");
            return;
        }

        // Read the current poll config file
        let configContent = fs.readFileSync(POLL_CONFIG_FILE_PATH, "utf8");
        
        for (const update of updates) {
            const { key, value } = update;
            const exportPattern = new RegExp(`^export const ${key} = .*$`, "m");
            const newLine = `export const ${key} = "${value}"`;
            
            if (exportPattern.test(configContent)) {
                // Replace existing export
                configContent = configContent.replace(exportPattern, newLine);
                console.log(`✓ Updated ${key} in poll config.ts`);
            } else {
                // Add new export at the end of the file
                if (!configContent.endsWith('\n')) {
                    configContent += '\n';
                }
                configContent += `${newLine}\n`;
                console.log(`✓ Added ${key} to poll config.ts`);
            }
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(POLL_CONFIG_FILE_PATH, configContent);
        console.log("✓ Poll config file updated successfully");
        
    } catch (error) {
        console.error("Failed to update poll config file:", error);
        // Don't throw error to avoid breaking the main process
        console.error("Continuing without updating poll config...");
    }
};

export const updateWebConfig = (updates: ConfigUpdate[]): void => {
    try {
        // Check if web config file exists
        if (!fs.existsSync(WEB_CONFIG_FILE_PATH)) {
            console.log("Web config file not found, skipping update");
            return;
        }

        // Read the current web config file
        let configContent = fs.readFileSync(WEB_CONFIG_FILE_PATH, "utf8");
        
        for (const update of updates) {
            const { key, value } = update;
            const exportPattern = new RegExp(`^export const ${key} = .*$`, "m");
            const newLine = `export const ${key} = "${value}";`;
            
            if (exportPattern.test(configContent)) {
                // Replace existing export
                configContent = configContent.replace(exportPattern, newLine);
                console.log(`✓ Updated ${key} in web config.ts`);
            } else {
                // Add new export at the end of the file
                if (!configContent.endsWith('\n')) {
                    configContent += '\n';
                }
                configContent += `${newLine}\n`;
                console.log(`✓ Added ${key} to web config.ts`);
            }
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(WEB_CONFIG_FILE_PATH, configContent);
        console.log("✓ Web config file updated successfully");
        
    } catch (error) {
        console.error("Failed to update web config file:", error);
        // Don't throw error to avoid breaking the main process
        console.error("Continuing without updating web config...");
    }
}; 