# Creating The Quiet Consensus Polling Contract
This document describes the process of creating the Quiet Consensus polling contract.



### Compiling the polling contract

1. Move to `poll/contract/`
    `cd ~/Repos/quiet-consensus/poll/contract`

2. Compile the contract by running:

    `make build-mainnet-reproducible`

This results in `poll/contract/contract.wasm.gz`

### Uploading the polling contract

1. Move to `poll/uploader/`
    `cd ~/Repos/quiet-consensus/poll/uploader`
2. Install deps

    ```
    npm install
    ```
3. Validate the contract (optional):
    `npm run validate`
4. Run `npm run upload`
5. Record the resulting Code id and Contract hash in the `.env`  file in `poll/uploader/` like:
    ```
    POLLING_CONTRACT_CODE_ID="14554"
    POLLING_CONTRACT_CODE_HASH="ae155c48ceb59d415e7b6094ce4e102275cf8016661c96ad396c40a4d723b4f4"
    ```

### Instantiating the polling contract

1. make sure you're in `poll/uploader/``

   `cd ~/Repos/quiet-consensus/poll/uploader`
2. Ensure your `.env` file contains the `POLLING_CONTRACT_CODE_ID` and `POLLING_CONTRACT_CODE_HASH` values from the upload step
3. Run `npm run instantiate` (this reads the code ID and code hash from your `.env` file)
4. Record the resulting Contract address and put it along with the Contract hash in the `config.ts` file in `web/src/` like:
    ```
    export const POLLING_CONTRACT_CODE_HASH = "ae155c48ceb59d415e7b6094ce4e102275cf8016661c96ad396c40a4d723b4f4"; 
    export const POLLING_CONTRACT_ADDRESS = "secret1e8q73q6mcmuxxwn7n3r3c0eg3442jqcdq93ys0";
    ```
