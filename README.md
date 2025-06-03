# quiet-consensus

## Other Pages
- [README.md](./README.md)
- [Quiet Consensus](./docs/qui-con.md)
- [Architecture](./docs/architecture.md)

## To Do
- Create SCT viewing keys
- Create the polling contract
- Link-up front end to blockchain

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
```
quiet-consensus/
├── Cargo.toml
├── README.md
├── docs/       ←  Documentation
│   ├── ...
│   └── ...
├── poll/       ←  Polling smart contract
│   ├── ...
│   └── ...
├── sct/        ←  SCT (NFT) contract
│   ├── ...
│   └── ...
└── web/        ←  React app front end
    ├── ...
    └── ...
```

## Assignment

https://hackmd.io/@darwinzero/r1xyCW_xxg

https://learn.canterbury.ac.nz/mod/assign/view.php?id=4187466


## Secret Auction

https://eng-git.canterbury.ac.nz/bta47/secret-auction-monorepo


## Secret Network

https://scrt.network/

https://docs.scrt.network/secret-network-documentation

https://github.com/scrtlabs/secret-toolkit

https://github.com/scrtlabs/secret.js


## SNIP-721

https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-721.md

https://github.com/baedrik/snip721-reference-impl


## SNIP-722

https://github.com/SecretFoundation/SNIPs/blob/master/SNIP-721.md

https://github.com/baedrik/snip-722-spec/blob/master/SNIP-722.md


