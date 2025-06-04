# quiet-consensus

## To Do
- Create the polling contract
- Link-up front end to blockchain


### Polling Contract Design

#### Storages

##### POLLS
The contract keeps a `POLLS` map of poll_id -> Poll.
Each Poll contains:
- poll_id   (Unique identifier (SHA-256 of title+options))
- title     (The question for the poll)
- description     (Full question or context)
- created_at     (When the poll was created)
- options     (List of voting options)
- tally     (Vote count per option index)
- metadata     (Additional metadata as key-value pairs)

##### VOTED
`VOTED` prevents double-voting by mapping (poll_id, hashed_voter_address) ⇒ (). If they have votes the key exists.

##### SCT Contract
The polling contract needs to be able to communicate with the SCT contract, so we require the address and code hash:
- `SCT_CONTRACT_ADDRESS`
- `SCT_CODE_HASH`

##### POLL_COUNT
`POLL_COUNT` (u32) holds a running total of the number of polls.



#### Actions

##### get_polls
- No arguments
- This is able to be used by anyone
- Returns a list of polls like: 
   - [( poll_id, title, description, created_at, options, tally, metadata)].


##### make_poll
- Arguments:
   - title
   - description
   - options
- Making poll fails gracefully if:
   - The resulting poll_id already taken (same title+options)
   - Invalid poll contents (empty title, >8 options, etc.)
   - Not enough gas/fees
   - etc.
- If making a poll succeeds we:
   - Get a poll_id and created_at
   - Set tally as 0's
   - Set metadata (empty for now)
   - Add the poll to `POLLS`
   - Increment `POLL_COUNT`


##### cast_vote
- Arguments:
   - poll_id
   - option_idx
- Making poll fails gracefully if:
   - Caller does not hold a SCT
   - option_idx or poll_id is invalid
   - Have not already voted
   - Not enough gas/fees
   - etc.
- If making a poll succeeds we:
   - Increment tally on this poll
   - Add user to `VOTED` for this poll




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

