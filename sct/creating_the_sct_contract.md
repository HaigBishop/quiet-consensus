# Creating The Soulbound Credential Token Contract
This document describes the process of creating the soulbound credential token (SCT).


## The End Result

The end result of this is a SNIP-722 NFT on the secret test network. In the process an admin account is specified, which will have the ability to mint SCTs on this contract.

The details of the contract (transactions, address, etc.) are put into `sct-contract.txt`.


## 1. Creating the admin account
1. Create a new wallet on Keplr (e.g. call it "Quiet Consensus Admin")
2. Add the secret test network
3. Update secret testnet end points:
    - RPC: https://pulsar.rpc.secretnodes.com
    - LCD: https://pulsar.lcd.secretnodes.com
4. Copy your wallet address
5. Use the faucet: https://pulsar-3-faucet.vercel.app/


## 2. Setting up secretcli

See the secretcli docs here: https://docs.scrt.network/secret-network-documentation/infrastructure/secret-cli

1. Install secretcli (see docs)
2. Configure the client
    ```bash
    # Update config
    secretcli config set client chain-id pulsar-3
    secretcli config set client node https://pulsar.rpc.secretnodes.com
    secretcli config set client output json
    secretcli config set client keyring-backend test
    # View updated config
    secretcli config view client
    ```
3. Add the admin account to secretcli
    ```bash
    # Recover the account 
    secretcli keys add quiconadmin --recover 
    # (then enter the recovery phrase)
    ```


## 3. Storing the SNIP-721 reference implementation on the blockchain

1. Compile the SNIP-721 contract (creates `sct/snip721_reference.wasm.gz`)
    (see docs for this here: https://docs.scrt.network/secret-network-documentation/development/readme-1/compile-and-deploy)
    ```bash
    mkdir ~/temp_build/
    cd ~/temp_build/
    # Clone the reference implementation
    git clone https://github.com/baedrik/snip721-reference-impl.git
    cd snip721-reference-impl
    # Compile + optimise + gzip -> contract.wasm.gz
    make compile-optimized-reproducible 
    # Copy artefact wherever you need it
    cp contract.wasm.gz ~/Repos/quiet-consensus/sct/snip721_reference.wasm.gz
    # Clean up the temp build dir
    cd ~
    rm -rf ~/temp_build
    ```

2. Send the store transaction
    ```bash
    cd ~/Repos/quiet-consensus/sct/
    secretcli tx compute store snip721_reference.wasm.gz --from quiconadmin --gas 3000000
    ```

    ​This might return something like this, which contrains the txhash.

    ```bash
    hdfoTn3raP/GdVs+Xzo/PMnwtsuUeIkN6FP8fkM5qskO4CwA=","source":"","builder":""}],"memo":"","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{"signer_infos":[],"fee":{"amount":[{"denom":"uscrt","amount":"750000"}],"gas_limit":"3000000","payer":"","granter":""},"tip":null},"signatures":[]}
    confirm transaction before signing and broadcasting [y/N]: y
    {"height":"0","txhash":"8ACD08F99BB1E78BC43EB8F507393331F9C58B63B9E700A8E7FE7E377AFB401E","codespace":"","code":0,"data":"","raw_log":"","logs":[],"info":"","gas_wanted":"0","gas_used":"0","tx":null,"timestamp":"","events":[]}
    haig@HAIGS-LAPPY-FED:~/Repos/quiet-consensus/sct$ 

    ```

    ​You can save the txhash into a variable

    ```bash
    export TX_HASH=8ACD08F99BB1E78BC43EB8F507393331F9C58B63B9E700A8E7FE7E377AFB401E
    ```

3. Grab the `code_id` that the chain returns
    It shows up in the tx log (or run):

    ```bash
    secretcli q tx "$TX_HASH" | more
    ```

    This might return this below for example. It contains the Code ID. You need to read the Code ID. In this case you can see the Code ID is 14505.
    ```bash
    {"height":"10821936","txhash":"8ACD08F99BB1E78BC43EB8F507393331F9C58B63B9E700A8E7FE7E377AFB401E","codespace":"","code":0,"data":"12330A2C2F736
    5637265742E636F6D707574652E763162657461312E4D736753746F7265436F6465526573706F6E7365120308A971","raw_log":"","logs":[],"info":"","gas_wanted":"
    3000000","gas_used":"2816054","tx":{"@type":"/cosmos.tx.v1beta1.Tx","body":{"messages":[{"@type":"/secret.compute.v1beta1.MsgStoreCode","sende
    r":"secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w","wasm_byte_code":"H4sIAAAAAAACA+xbfXBdxXXfz3vv+5D8AAGCKMl9DzWVW7uIDMgO9R++GZyQAWaaGf6gM5mRZ
    emB9GTL1ocN7h+SEjxgCknNZxrSfJS2oUDTKZ+FkriGMJlMm6Y0hcZMSbCBGo/Dh0NIEQ1pes7Z3

    ... [THIS PART IS OMITTED]

    XRhL4230/3QvFLjHXRhb4130oV9NI6hC/tqHEsX9tN4F13YX+PddOEAjffQhQM1j
    qObbw7SOJ4uvErjvXTh1Rrvowuv0Xg/XThY4wN04bUaH6QLr9P4EF14vcaH6R4zb9A4gS68UeMjdOFNGh811x/j59hBqLov65HHGwONF5v5MKyxhlkAIxprmoUwqrGWmXmcJ08aa5tZ0B+
    5jpkDEzXW5fohMEljPbowWWN9ujBFYwO6MFVjQ7owTWMjuid48qSxMV1YVGMTurCYxqZ0YXGNzejCEhqb04UXaWxBF5bUeAldWEpjS7onefKksRVdWEZja7qwrMY2dGE5jW3pwvIa29GFF
    TS2pwsraryULqyk8TK6p3jypPFyurCKxg50YVWPdGE1jR3pwnSNneiazXsNfWDM+HF//bYWX7O+8t+/N+lff7o+WjxUV38i+nPqkeKhdfoTn3raP/GdVs+Xzo/PMnwtsuUeIkN6FP8fkM5
    qskO4CwA=","source":"","builder":""}],"memo":"","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{
    "signer_infos":[{"public_key":{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A+KklEazmk+NyJKZQ6i7aTxmy4Xy1UkNYTnsZ7Cqlgzv"},"mode_info":{"s
    ingle":{"mode":"SIGN_MODE_DIRECT"}},"sequence":"4"}],"fee":{"amount":[{"denom":"uscrt","amount":"750000"}],"gas_limit":"3000000","payer":"","g
    ranter":""},"tip":null},"signatures":["3t/SWi0eGpWCbFGuIXXbKTYyvd8V0DPb1EZJiV6pH3h4zkUCyqq17+NZdKUmvqoaNP7PVdQuIHanlu+szBKThg=="]},"timestamp"
    :"2025-06-03T01:54:49Z","events":[{"type":"coin_spent","attributes":[{"key":"spender","value":"secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w",
    "index":true},{"key":"amount","value":"750000uscrt","index":true}]},{"type":"coin_received","attributes":[{"key":"receiver","value":"secret17x
    pfvakm2amg962yls6f84z3kell8c5ljuhfkp","index":true},{"key":"amount","value":"750000uscrt","index":true}]},{"type":"transfer","attributes":[{"k
    ey":"recipient","value":"secret17xpfvakm2amg962yls6f84z3kell8c5ljuhfkp","index":true},{"key":"sender","value":"secret1ve9p7363enrj9v5f3fq428tq
    xvzl836wgrgk3w","index":true},{"key":"amount","value":"750000uscrt","index":true}]},{"type":"message","attributes":[{"key":"sender","value":"s
    ecret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w","index":true}]},{"type":"tx","attributes":[{"key":"fee","value":"750000uscrt","index":true},{"ke
    y":"fee_payer","value":"secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w","index":true}]},{"type":"tx","attributes":[{"key":"acc_seq","value":"se
    cret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w/4","index":true}]},{"type":"tx","attributes":[{"key":"signature","value":"3t/SWi0eGpWCbFGuIXXbKTYy
    vd8V0DPb1EZJiV6pH3h4zkUCyqq17+NZdKUmvqoaNP7PVdQuIHanlu+szBKThg==","index":true}]},{"type":"message","attributes":[{"key":"action","value":"/se
    cret.compute.v1beta1.MsgStoreCode","index":true},{"key":"sender","value":"secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w","index":true},{"key":
    "msg_index","value":"0","index":true}]},{"type":"message","attributes":[{"key":"module","value":"compute","index":true},{"key":"sender","value
    ":"secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w","index":true},{"key":"signer","value":"secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w","index
    ":true},{"key":"msg_index","value":"0","index":true}]},{"type":"message","attributes":[{"key":"code_id","value":"14505","index":true},{"key":"
    msg_index","value":"0","index":true}]}]}
    ```

    Then just export the Code ID for later steps. (also stored in sct-contract.txt)

    ```bash
    export CODE_ID=14505
    ```


## 4. Designing the NFT contract

```bash
# Generate additional entropy
export PRNG=$(head -c 32 /dev/urandom | base64)
# Set the admin account
export TOKEN_ADMIN="secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w"
# Create the instantiation message
INST_MSG=$(jq -nc \
  --arg name "SoulboundCredentialToken" \
  --arg admin "$TOKEN_ADMIN" \
  --arg symbol "SCT" \
  --arg prng "$PRNG" \
  '{
    name: $name,
    symbol: $symbol,
    admin: $admin,
    entropy: $prng,
    config: {
      public_total_supply: true,
      public_owner: false,
      enable_sealed_metadata: false,
      unwrapped_metadata_is_private: false,
      minter_may_update_metadata: true,
      owner_may_update_metadata: false,
      enable_burn: true
      }
  }')
```


## 5. Instantiate the NFT contract

This command deploys the contract and outputs logs.

```bash
# (we need CODE_ID and INST_MSG from above)
secretcli tx compute instantiate "$CODE_ID" "$INST_MSG" --from quiconadmin --gas 200000 --label "SoulboundCredentialToken"
```

This will output something like below. 

```bash
haig@HAIGS-LAPPY-FED:~$ secretcli tx compute instantiate "$CODE_ID" "$INST_MSG" --from quiconadmin --gas 200000 --label "SoulboundCredentialToken"
{"body":{"messages":[{"@type":"/secret.compute.v1beta1.MsgInstantiateContract","sender":"secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w","callback_code_hash":"","code_id":"14505","label":"SoulboundCredentialToken","init_msg":"KjGx8a5YyYGFf29hgdhljitN5hp/tLDOSDnHfXOus4+lP4khmvyuEi74gE3XU5YNev5yKtDULj4iPWn8ydhdbSIgvQ0TUqMdy5eBqXFAMLjeeegOLacqtXliVTO4k31OPHCKB3Da9D0jJ/25CwfpGF+qKdQZsoM3abHiUdcWKUENZ1uAnwIXwEq0MYqijNkINQvHp9oA6IC++veMTGb7iTrh7icoQ59A2FOUDGfrQICSILndOdxNHA+oi1I1SBX2kEPLIs/xqBYQlbkdzilTg0ptC8hJIOE8d2K3lmc/QyPYXlKSRcnz1MDBv12qeV53zPfBcZwiEu6rlhpCYMO2czSA/fXF7vQ4YqYT6ifrWg3dgLE2dqwBjztIJWZLASoJWlhVQDmS4YSDhpKHyy/1e3kPONSMu26Uw0xrWPIDVN7W4OdgEkqHYTgw0o8GXdD5AMCNP49Uj/6T/2Bd66RP0OJH8vzG/5xs2Eaetw06sU9QC7sqQDXnnt9E/nWwHm6wZQ98Zuo4VT77U06uPLlFllVugZZ5Fz6P35vsbiPFBE9t+Ew12dOFBmHl9Jg7bSR0d6JuRzX490HEc6HoHxiC/zIKQIt1I2NjtIK8kg1Tl6jwsfZNfglHVk6zBn0pzbuhLyD5LdlHxrX5Nn4Da8sTfm64Jyk64wY3+bkSX5hr7quTEbFo0L0BPrbT","init_funds":[],"callback_sig":null,"admin":""}],"memo":"","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{"signer_infos":[],"fee":{"amount":[{"denom":"uscrt","amount":"50000"}],"gas_limit":"200000","payer":"","granter":""},"tip":null},"signatures":[]}
confirm transaction before signing and broadcasting [y/N]: y
{"height":"0","txhash":"A1B71028C291BAD0B813E0D56E2F74B62073FFA801BBE72A6BA23CBA99BD6723","codespace":"","code":0,"data":"","raw_log":"","logs":[],"info":"","gas_wanted":"0","gas_used":"0","tx":null,"timestamp":"","events":[]}
haig@HAIGS-LAPPY-FED:~$ 
```

Check by listing all contracts under the code ID. 

```bash
secretcli query compute list-contract-by-code 14505
```

This will output something like below. 

```bash
{"contract_infos":[{"contract_address":"secret1l45xfk5mw7cyfnyrferj0ezcxd8krrlpcfnyee","contract_info":{"code_id":"14505","creator":"secret1ve9p7363enrj9v5f3fq428tqxvzl836wgrgk3w","label":"SoulboundCredentialToken","created":null,"ibc_port_id":"","admin":"","admin_proof":null}}}
```
