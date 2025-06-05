# quiet-consensus

Quiet Consensus is a totally anonymous polling platform made possible with Secret Network. It also only allows voting by individuals that hold a Soulbound Credential Token (SCT), ensuring that every vote originates from a single person, and no single person can vote multiple times. Quiet Consensus is accessible via a webpage and by using the Keplr wallet.

### Key Features
- Perfectly anonymous polling
- Sybil resistance
- Smooth frontend webpage


## To Do
- Finish the polling contract (SCT contract connection)


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

