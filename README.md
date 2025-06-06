# quiet-consensus

Quiet Consensus is a totally anonymous polling platform made possible with Secret Network. It also only allows voting by individuals that hold a Soulbound Credential Token (SCT), ensuring that every vote originates from a single person, and no single person can vote multiple times. Quiet Consensus is accessible via a webpage and by using the Keplr wallet.

### Key Features
- **Perfectly anonymous polling**: Votes are completely private thanks to Secret Network
- **Sybil resistance**: Only SCT (Soulbound Credential Token) holders can vote, ensuring one person = one vote
- **Smooth frontend**: Intuitive React interface with automated permit handling



## Repository Structure

The Quiet Consensus repository consists of multiple stand-alone sub components

### Structure
```
quiet-consensus/
├── README.md
├── philosophy.md
├── poll/       ←  Polling smart contract
│   ├── ...
│   └── ...
├── sct/        ←  SCT contract
│   ├── ...
│   └── ...
└── web/        ←  React app front end
    ├── ...
    └── ...
```

### Polling Contract Component (`poll/`)
- Polling contract source code
- Compilation of polling contract
- Deployment of polling contract

### Soulbound Credential Token Contract Component (`sct/`)
- Compilation of SNIP-721 contract
- Deployment of SCP (SNIP-721) contract
- Minting of SCPs

### Frontend Component (`web/`)
- Single page React web application
- Contains secretjs API with the polling contract



## How to Deploy

This is a high-level overview of how to deploy all components of the Quiet Consensus project onto the Secret test net.

### Instantiate and Mint SCTs

See `sct/creating_the_sct_contract.md` and `sct/minting_sct_nfts.md` for clear instructions.

1. Create admin account in Keplr and fund via faucet
2. Upload and instantiate SCT contract (`sct/uploader/`)
    (update `poll/uploader/src/config.ts` and `web/src/config.ts` with contract addresses and hashes)
3. Create user accounts in Keplr and fund them
4. Mint SCTs to users

### Instatiate the Polling Contract

See `poll/creating_the_polling_contract.md` for clear instructions.

1. Compile polling contract (`poll/contract/`)
2. Upload and instantiate polling contract (`poll/uploader/`)
    (update `web/src/config.ts` with contract addresses and hashes)

### Hosting the Front End

See `hosting_front_end.md` for clear instructions.

1. Ensure the correct contract addresses are set in `web/src/config.ts`
2. Run `npm install && npm run dev` in `web/` directory

### Quick workflow
If you know what you're doing, running all of these commands (or some variation) at once will deploy all components in the correct order connecting everything together perfectly.

```bash
cd ~/Repos/quiet-consensus/sct/uploader/
npm install
npm run upload
sleep 10
npm run instantiate
sleep 10
npm run mint
cd ~/Repos/quiet-consensus/poll/contract
make build-mainnet-reproducible
cd ~/Repos/quiet-consensus/poll/uploader
npm install
npm run upload
sleep 10
npm run instantiate
cd ~/Repos/quiet-consensus/web/
npm install
npm run dev
echo done!

```



## Relevant Links

### dApp Tutorial

https://hackmd.io/@darwinzer0/HJD0p5n60


### Assignment

https://hackmd.io/@darwinzero/r1xyCW_xxg

https://learn.canterbury.ac.nz/mod/assign/view.php?id=4187466


### Secret Auction

https://eng-git.canterbury.ac.nz/bta47/secret-auction-monorepo


### Secret Network

https://scrt.network/

https://docs.scrt.network/secret-network-documentation

https://github.com/scrtlabs/secret-toolkit

https://github.com/scrtlabs/secret.js


### SNIP-721

https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-721.md

https://github.com/baedrik/snip721-reference-impl


### SNIP-722

https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-721.md

https://github.com/baedrik/snip-722-spec/blob/master/SNIP-722.md

