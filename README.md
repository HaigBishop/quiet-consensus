# quiet-consensus

## To Do
- Upload and instantiate polling contract
- Link-up front end to blockchain
- Finish the polling contract (SCT contract connection)



### Frontend-Blockchain Linking: 

- Submit new poll to blockchain
   - Actually submits new poll
   - Could refresh polls until we see it (make UPDATE_REFRESH_FREQUENCY and UPDATE_REFRESH_TIMEOUT)
- Submit vote to blockchain
   - Actually submits vote
   - Could refresh polls until we see it (make UPDATE_REFRESH_FREQUENCY and UPDATE_REFRESH_TIMEOUT)
- Fetch states of polls from blockchain 
   - Actually fetches polls -> PollStore
   - Remove example initialisation of polls (or comment out?)
   - Fetch at start-up then regularly (make REFRESH_POLLS_EVERY)




## Repository Structure

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





## Links

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

