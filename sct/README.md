# SCT (Soulbound Credential Token) Component

This component manages the creation, deployment, and minting of Soulbound Credential Tokens (SCTs) on the Secret Network.

## Overview

SCTs are non-transferable NFTs (SNIP-721) that represent:
- Proof-of-humanity (verification that the holder is a real person)
- Group membership (confirmation of belonging to a specific community)
- One-per-person guarantee (each individual can only have one SCT)

## Directory Structure

```
sct/
├── uploader/           # TypeScript tools for contract management
│   ├── src/
│   │   ├── upload.ts       # Upload SNIP-721 contract to Secret Network
│   │   ├── instantiate.ts  # Instantiate the SCT contract
│   │   └── mint.ts         # Mint SCTs to user accounts
│   ├── package.json
│   ├── tsconfig.json
│   └── env.example     # Example environment configuration
├── contract/           # Contract binaries (auto-generated)
├── creating_the_sct_contract.md    # Contract creation guide
└── minting_sct_nfts.md            # NFT minting guide
```


## Documentation

- [Creating the SCT Contract](./creating_the_sct_contract.md) - Step-by-step guide for contract deployment
- [Minting SCT NFTs](./minting_sct_nfts.md) - Instructions for minting SCTs to users

