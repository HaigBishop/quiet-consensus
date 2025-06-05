
# Polling Contract Design

---

## Storages (for `state.rs`)

### POLLS
The contract keeps a `POLLS` map of poll_id -> Poll.
Each Poll contains:
- poll_id   (Unique identifier (SHA-256 of title+options))
- title     (The question for the poll)
- description     (Full question or context)
- created_at     (When the poll was created)
- options     (List of voting options)
- tally     (Vote count per option index)

### VOTES
`VOTES` prevents double-voting and tracks votes by mapping (poll_id, hashed_voter_address) -> option_idx. This stores which option each user voted for on each poll. It also allows users to view their votes

### SCT Contract
The polling contract needs to be able to communicate with the SCT contract, so we require the address and code hash:
- `SCT_CONTRACT_ADDRESS`
- `SCT_CODE_HASH`

### POLL_COUNT
`POLL_COUNT` (u32) holds a running total of the number of polls.

---

## Messages (for `msg.rs`)

### instantiate
- Only sent once by the contract creator to initialise the state of the contract
- Costs gas

### get_polls
- Query message
- No arguments
- This is able to be used by anyone
- Returns a list of polls like: 
   - [( poll_id, title, description, created_at, options, tally)].

### get_num_polls
- Query message
- No arguments
- This is able to be used by anyone
- Returns a number: `POLL_COUNT`

### make_poll
- Execute message
- Arguments:
   - title
   - description
   - options
- Making poll fails gracefully if:
   - The resulting poll_id already taken (same title+options)
   - Invalid poll contents 
     - <2 options or >8 options
     - empty title or description
     - title length > 100 chars
     - description length > 500 chars
   - Not enough gas/fees
   - etc.
- If making a poll succeeds we:
   - Get a poll_id and created_at
   - Set tally as 0's
   - Add the poll to `POLLS`
   - Increment `POLL_COUNT`


### cast_vote
- Execute message
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
   - Add user to `VOTES` for this poll

### get_my_vote
- Query message (with permit)
- This is able to be used by anyone
- Arguments:
   - poll_id
   - also uses sender's address
- Getting vote fails gracefully if:
   - poll_id is invalid
   - the sender is not legit
- If the sender voted on the given poll
   - Return the option_idx they voted
- If the sender has not voted on the given poll
   - Return null or whatever
