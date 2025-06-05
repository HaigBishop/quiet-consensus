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
    
    The `config.ts` file will be automatically updated with the new Code ID and Contract hash.

### Instantiating the polling contract

1. Make sure you're in `poll/uploader/`

   `cd ~/Repos/quiet-consensus/poll/uploader`
2. Run `npm run instantiate`
    
    The `web/src/config.ts` file will be automatically updated with the Contract address and Contract hash.
