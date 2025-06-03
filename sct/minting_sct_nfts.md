# Minting Soulbound Credential Tokens

This document describes minting three non-transferable SCT NFTs. Before proceeding, ensure you have completed the steps in `creating_the_sct_contract.md`.

If you have followed `creating_the_sct_contract.md`, then the contract info will be saved into `sct-contract.txt` (including `CODE_ID` and `SCT_CONTRACT_ADDRESS`). And the admin account (“Quiet Consensus Admin”) will be added to secretcli under the key name `quiconadmin`.


## 1. Create the user accounts in Keplr

1. In Keplr click “Create new wallet”.
2. Copy each wallet’s mnemonic into `user-wallets.txt`.
3. Name it like “Quiet Consensus User 1”.
4. Add the secret test network
5. Update secret testnet end points if required
    - RPC: https://pulsar.rpc.secretnodes.com
    - LCD: https://pulsar.lcd.secretnodes.com
6. Copy each wallet’s secret net address (starting `secret1…`) into `user-wallets.txt`.
7. Repeat for “Quiet Consensus User 2” and “Quiet Consensus User 3”.
8. At the end of this step, you should have three new Keplr wallets with their info stored in `user-wallets.txt` like:
    ```
    # -------------------------------------------------------
    ### Quiet Consensus User 1
    >KEY_PHRASE
    various double all gospel note trade major crane must mansion render they
    >ADDRESS
    secret1evmzszph47j8kymhkd8c76h2h5jhxgsd7wpauc
    
    # -------------------------------------------------------
    ### Quiet Consensus User 2
    >KEY_PHRASE
    bone meadow salute patient trust globe crush poet shell shoe join item
    >ADDRESS
    secret12u0xz7dtxp53s60jetnnd6wlfl468m34avjlpp
    
    # -------------------------------------------------------
    ### Quiet Consensus User 3
    >KEY_PHRASE
    peace bomb camera exhaust asthma own employ dream under noise electric adjust
    >ADDRESS
    secret14evc5pmhz9sm5z55cztl6r5h6lmx7qwuuz0gwy
    ```


## 2. Fund each user account via the faucet

For each new address, open the Pulsar 3 faucet at

```
https://pulsar-3-faucet.vercel.app/
```

and paste in the new wallet address. You can use incognito mode to use multiple times. Confirm each account has balance in Keplr.



## 4. Mint a non-transferable SCT NFT to each user

Recall from `sct-contract.txt` that:

* `CODE_ID=14505`
* `SCT_CONTRACT_ADDRESS=secret1l45xfk5mw7cyfnyrferj0ezcxd8krrlpcfnyee`

We’ll mint three SCTs, setting `"transferable": false`.

1. Export the contract address to an environment variable:

   ```bash
   export SCT_CONTRACT=secret1l45xfk5mw7cyfnyrferj0ezcxd8krrlpcfnyee
   ```

2. Mint to Quiet Consensus User 1:

   ```bash
   secretcli tx compute execute "$SCT_CONTRACT" \
     '{
       "mint_nft": {
         "owner": "secret1evmzszph47j8kymhkd8c76h2h5jhxgsd7wpauc",
         "transferable": false
       }
     }' \
     --from quiconadmin \
     --gas 200000
   ```
   
   * `"owner"` is the user’s address exactly as known by secretcli.
   * We set `"transferable": false` to make it non-transferable.
   
3. Mint to Quiet Consensus User 2:

   ```bash
   secretcli tx compute execute "$SCT_CONTRACT" \
     '{
       "mint_nft": {
         "owner": "secret12u0xz7dtxp53s60jetnnd6wlfl468m34avjlpp",
         "transferable": false
       }
     }' \
     --from quiconadmin \
     --gas 200000
   ```
   
4. Mint to Quiet Consensus User 3:

   ```bash
   secretcli tx compute execute "$SCT_CONTRACT" \
     '{
       "mint_nft": {
         "owner": "secret14evc5pmhz9sm5z55cztl6r5h6lmx7qwuuz0gwy",
         "transferable": false
       }
     }' \
     --from quiconadmin \
     --gas 200000
   ```



## 5. Check ownership of SCTs

Here we will check that the SCTs were successfully minted by using secretcli to create viewing keys. For real users, viewing keys will only be made by them in the frontend, but this is just testing.

1. Add user accounts to secretcli

   ```bash
   # For Quiet Consensus User 1
   secretcli keys add quiconuser1 --recover
   # (paste the mnemonic here)
   
   # For Quiet Consensus User 2
   secretcli keys add quiconuser2 --recover
   # (paste the mnemonic here)
   
   # For Quiet Consensus User 3
   secretcli keys add quiconuser3 --recover
   # (paste the mnemonic here)
   ```


2. For each user, create a viewing key
    ???
   
3. Query token ownership
    ???