# Minting Soulbound Credential Tokens

This document describes minting three non-transferable SCT NFTs using TypeScript and secretjs. Before proceeding, ensure you have completed the steps in [creating_the_sct_contract.md](./creating_the_sct_contract.md).


## Prerequisites

Ensure your `.env` file in `sct/uploader/` contains:
- `ADMIN_MNEMONIC` - The admin wallet mnemonic
- `SCT_CODE_HASH` - The SCT contract code hash
- `SCT_CONTRACT_ADDRESS` - The deployed SCT contract address


## 1. Create the user accounts in Keplr

1. In Keplr click "Create new wallet"
2. Name it like "Quiet Consensus User 1"
3. Add the secret test network
4. Update secret testnet end points if required:
    - RPC: https://pulsar.rpc.secretnodes.com
    - LCD: https://pulsar.lcd.secretnodes.com
5. Copy the wallet's mnemonic and address
6. Repeat for "Quiet Consensus User 2" and "Quiet Consensus User 3"
7. Update your `.env` file with the user details:
    ```
    USER1_MNEMONIC="various double all gospel note trade major crane must mansion render they"
    USER1_ADDRESS="secret1evmzszph47j8kymhkd8c76h2h5jhxgsd7wpauc"
    
    USER2_MNEMONIC="bone meadow salute patient trust globe crush poet shell shoe join item"
    USER2_ADDRESS="secret12u0xz7dtxp53s60jetnnd6wlfl468m34avjlpp"
    
    USER3_MNEMONIC="peace bomb camera exhaust asthma own employ dream under noise electric adjust"
    USER3_ADDRESS="secret14evc5pmhz9sm5z55cztl6r5h6lmx7qwuuz0gwy"
    ```


## 2. Fund each user account via the faucet

For each new address, open the Pulsar 3 faucet:

```
https://pulsar-3-faucet.vercel.app/
```

Paste in each wallet address and request tokens. You can use incognito mode to use the faucet multiple times. Confirm each account has balance in Keplr.


## 3. Mint non-transferable SCT NFTs

1. Make sure you're in `sct/uploader/`
2. Ensure your `.env` file in `sct/uploader/` has all required values
3. Run `npm run mint`

    This will:

    - Mint a non-transferable SCT NFT to each user from the admin account
    - Create viewing keys for each user account
    - Verify NFT ownership using the viewing keys
4. Watch the output for confirmation, for example:
    ```
    Checking NFT ownership for Quiet Consensus User 1...
    ✓ NFT ownership query successful for Quiet Consensus User 1
    Quiet Consensus User 1 owns 2 SCT NFT(s)
    Token IDs: sct-1748998365932, sct-1749002721751
    Ownership info saved to logs/ownership_tx_user_1.json
    
    Checking NFT ownership for Quiet Consensus User 2...
    ✓ NFT ownership query successful for Quiet Consensus User 2
    Quiet Consensus User 2 owns 2 SCT NFT(s)
    Token IDs: sct-1748998371232, sct-1749002727126
    Ownership info saved to logs/ownership_tx_user_2.json
    
    Checking NFT ownership for Quiet Consensus User 3...
    ✓ NFT ownership query successful for Quiet Consensus User 3
    Quiet Consensus User 3 owns 2 SCT NFT(s)
    Token IDs: sct-1748998375925, sct-1749002738384
    Ownership info saved to logs/ownership_tx_user_3.json
    
    SCT minting and verification process completed!
    
    === Viewing Keys ===
    User 1 viewing key: 44mgktlew3gy8k5m8nsso
    User 2 viewing key: xml59b14s3rgpobnunf5mi
    User 3 viewing key: 408ec147ki9r31rl8iwjpk
    
    All transaction logs and ownership info saved to logs/ directory
    ```

5. Optional: You may want to save the viewing keys in `.env`, like this:

   ```
   USER1_VIEWING_KEY="0afcxj7wv1pluaiuaqx0o2"
   USER2_VIEWING_KEY="np3931t9nmlbc0quow8cef"
   USER3_VIEWING_KEY="u78lhftdhmqrpxjhb5txq"
   ```

   
