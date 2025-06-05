# Creating The Soulbound Credential Token Contract
This document describes the process of creating the soulbound credential token (SCT) using TypeScript and secretjs.


## Prerequisites

### 1. Creating the admin account
1. Create a new wallet on Keplr (e.g. call it "Quiet Consensus Admin")
2. Add the secret test network
3. Update secret testnet end points:
    - RPC: https://pulsar.rpc.secretnodes.com
    - LCD: https://pulsar.lcd.secretnodes.com
4. Copy your wallet address and mnemonic
5. Use the faucet: https://pulsar-3-faucet.vercel.app/


### 2. Setting up the configuration

1. Update the `config.ts` file at `sct/uploader/src/config.ts` with your admin wallet mnemonic and address:

   ```typescript
    export const ADMIN_MNEMONIC = "stuff result visual zero coconut auction relax acquire divide soon link duck"; 
    export const ADMIN_ADDRESS = "secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w";
   ```

   **Note**: The provided `config.ts` file already contains test values for convenience. These are strictly for testnet usage only.


### 3. Installing dependencies

```bash
cd Repos/quiet-consensus/sct/uploader/
npm install
```


## Uploading the SCT contract

The upload script will automatically download and build the SNIP-721 reference implementation if needed.

1. Make sure you're in `sct/uploader/`
2. Run `npm run upload`

This will:
- Download the SNIP-721 reference implementation (if not already present)
- Build the contract using Docker
- Upload it to the Secret Test Network
- Display the Code ID and Code Hash
- Automatically update your `config.ts` file with the new values

## Instantiating the SCT contract

1. Make sure you're in `sct/uploader/`
2. Ensure your `config.ts` file contains the `SCT_CODE_ID` and `SCT_CODE_HASH` values from the upload step
3. Run `npm run instantiate`

This will:
- Read the code ID and code hash from your `config.ts` file
- Create a new instance of the SCT contract
- Configure it as "SoulboundCredentialToken" with symbol "SCT"
- Set your admin account as the contract admin
- Display the contract address
- Automatically update your `config.ts` file with the contract address
- Also update the poll uploader's `config.ts` file with SCT values for cross-project usage


## Next Steps

Once you have successfully created and instantiated the SCT contract, you can proceed to [minting SCT NFTs](./minting_sct_nfts.md).
