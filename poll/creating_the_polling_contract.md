# Creating The Quiet Consensus Polling Contract
This document describes the process of creating the Quiet Consensus polling contract.



### Compiling the polling contract

1. Move to `poll/contract/`
    `cd ~/Repos/quiet-consensus/poll/contract`
2. Compile it by running `make build-mainnet-reproducible`
   (This uses Docker for consistent, optimized builds)

This results in `poll/contract/contract.wasm.gz`



### Uploading the polling contract

1. Move to `poll/uploader/`
    `cd ~/Repos/quiet-consensus/poll/uploader`
2. Validate the contract (optional):
    `npm run validate`
3. Run `npm run upload`
4. Record the resulting Code id and Contract hash in `poll/uploader/.env` like:
    ```
    POLLING_CONTRACT_CODE_ID="14540"
    POLLING_CONTRACT_CODE_HASH="ae27de1ca2c38f9664a94898cdb7226ac6650798c55e86279a84a7a13ea187f5"
    ```



### Instantiating the polling contract

1. make sure you're in `poll/uploader/``

   `cd ~/Repos/quiet-consensus/poll/uploader`
2. Ensure your `.env` file contains the `POLLING_CONTRACT_CODE_ID` and `POLLING_CONTRACT_CODE_HASH` values from the upload step
3. Run `npm run instantiate` (this reads the code ID and code hash from your `.env` file)
4. Record the resulting Contract address and put it along with the Contract hash in `web/.env` like:
    ```
    POLLING_CONTRACT_ADDRESS="secret1xlzx8h0lhe9h768eqe75490sttqkvwaa349wwp"
    POLLING_CONTRACT_CODE_HASH="ae27de1ca2c38f9664a94898cdb7226ac6650798c55e86279a84a7a13ea187f5"
    ```
