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


### 2. Setting up the environment

1. Move to `sct/uploader/`
2. Update the `.env` file with your admin wallet details


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

Record the resulting Code ID and Code Hash. Update your `.env` file with these values:
```
SCT_CODE_ID="14505"
SCT_CODE_HASH="773c39a4b75d87c4d04b6cfe16d32cd5136271447e231b342f7467177c363ca8"
```


## Instantiating the SCT contract

1. Make sure you're in `sct/uploader/`
2. Ensure your `.env` file contains the `SCT_CODE_ID` and `SCT_CODE_HASH` values from the upload step
3. Run `npm run instantiate`

This will:
- Read the code ID and code hash from your `.env` file
- Create a new instance of the SCT contract
- Configure it as "SoulboundCredentialToken" with symbol "SCT"
- Set your admin account as the contract admin
- Display the contract address

Record the resulting Contract address. Update your `.env` file:
```
SCT_CONTRACT_ADDRESS="secret1s0xxet7evly0p6ry3r74tml244dj9m3737pa8g"
```


## Next Steps

Once you have successfully created and instantiated the SCT contract, you can proceed to [minting SCT NFTs](./minting_sct_nfts.md).
