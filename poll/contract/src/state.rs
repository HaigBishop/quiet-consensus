/*
state.rs

Defines the storage of the contract

See `polling-contract-design.md` for more details.
*/

// Imports
use schemars::JsonSchema;
use secret_toolkit::storage::{Item, Keymap};
use serde::{Deserialize, Serialize};
use cosmwasm_std::{CanonicalAddr, Timestamp};


// SCT contract related constants
pub static SCT_CONTRACT_ADDRESS_KEY: &[u8] = b"sct_contract_address";
pub static SCT_CONTRACT_ADDRESS: Item<CanonicalAddr> = Item::new(SCT_CONTRACT_ADDRESS_KEY);
pub static SCT_CODE_HASH_KEY: &[u8] = b"sct_code_hash";
pub static SCT_CODE_HASH: Item<String> = Item::new(SCT_CODE_HASH_KEY);


// Poll struct
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
pub struct Poll {
    pub poll_id: String,
    pub title: String,
    pub description: String,
    pub created_at: Timestamp,
    pub options: Vec<String>,
    pub tally: Vec<u32>
}


// Set of polls
pub static POLLS_KEY: &[u8] = b"polls";
pub static POLLS: Keymap<String, Poll> = Keymap::new(POLLS_KEY);


// Number of polls
pub static POLL_COUNT_KEY: &[u8] = b"poll_count";
pub static POLL_COUNT: Item<u32> = Item::new(POLL_COUNT_KEY);


// Map of (poll_id + hashed_voter_address) to their vote (option_idx)
pub static VOTES_KEY: &[u8] = b"voted";
pub static VOTES: Keymap<String, u32> = Keymap::new(VOTES_KEY);
