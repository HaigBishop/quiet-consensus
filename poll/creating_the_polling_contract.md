# Creating The Quiet Consensus Polling Contract
This document describes the process of creating the Quiet Consensus polling contract.



### Compiling the polling contract

1. Move to `poll/contract/`
2. Compile it by running `make build-reproducible`

This results in `poll/contract/optimized-wasm/poll.wasm.gz`



### Uploading the polling contract

1. Move to `poll/uploader/`
2. Run `npm run upload`


Record the resulting Code id and Contract hash.



### Instantiating the polling contract

1. make sure you're in `poll/uploader/`
2. Run `npm run instantiate {Code id} {Contract hash}`

Record the resulting Contract address. This can be used, along with the code hash, in the frontend react application (add to `.env` there).

