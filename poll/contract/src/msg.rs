/*
msg.rs

Defines the messages that can be sent to the contract
*/

// Imports
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use cosmwasm_std::Addr;
use secret_toolkit::permit::Permit;
use crate::state::Poll;


// InstantiateMsg is kinda like defining the parameters of the contract's constructor
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub sct_contract_address: Addr,
    pub sct_code_hash: String,
}


// ExecuteMsg defines the messages that can modify the contract state
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    // Create a new poll with title, description, and voting options
    MakePoll {
        title: String,
        description: String,
        options: Vec<String>,
    },
    // Cast a vote on an existing poll by poll_id and option index
    CastVote {
        poll_id: String,
        option_idx: u32,
        sct_viewing_key: String,
    },
}


// QueryMsg defines the query messages that can be sent to the contract (not modifying state)
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    // Get all polls
    GetPolls { },
    // Get the tally for a specific poll by poll_id
    GetNumPolls { },

    // Queries with permits
    WithPermit {
        // Permit used to verify querier identity
        permit: Permit,
        // Query to perform
        query: QueryWithPermit,
    },
}

// These are query messages that use permits
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryWithPermit {
    // A request to get the user's vote on a specific poll
    GetMyVote { 
        poll_id: String,
    },
}

// Responses to queries
#[derive(Serialize, Deserialize, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub enum QueryAnswer {
    GetPolls {
        polls: Vec<Poll>,
    },
    GetNumPolls {
        num_polls: u32,
    },
    GetMyVote {
        vote: Option<u32>,
    },
}
