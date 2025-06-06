/*
schema.rs
- Exports the JSON schemas for the contract's messages and state.
- These schemas are used for various purposes, including contract instantiation, execution, and querying.


To use:
cd ~/Repos/quiet-consensus/poll/contract
cargo run --features schema --bin schema


This creates ~/Repos/quiet-consensus/poll/contract/schema/ like:

schema/
├── execute_msg.json
├── instantiate_msg.json
├── poll.json
├── query_answer.json
├── query_msg.json
└── query_with_permit.json
*/

// Imports
use std::env::current_dir;
use std::fs::create_dir_all;
use cosmwasm_schema::{export_schema, remove_schemas, schema_for};
use polling_contract::msg::{InstantiateMsg, ExecuteMsg, QueryMsg, QueryWithPermit, QueryAnswer};
use polling_contract::state::Poll;

fn main() {
    // Construct the output directory path for the schemas
    //   -> poll/contract/schema/
    let mut out_dir = current_dir().unwrap();
    out_dir.push("schema");

    // Create the output directory if it doesn't exist.
    create_dir_all(&out_dir).unwrap();

    // Remove any existing schemas in the output directory to ensure a clean export.
    remove_schemas(&out_dir).unwrap();

    // Export the JSON schemas for the contract's messages and state.
    // These schemas are used for various purposes, including contract instantiation, execution, and querying.
    
    // Message schemas
    export_schema(&schema_for!(InstantiateMsg), &out_dir);
    export_schema(&schema_for!(ExecuteMsg), &out_dir);
    export_schema(&schema_for!(QueryMsg), &out_dir);
    export_schema(&schema_for!(QueryWithPermit), &out_dir);
    export_schema(&schema_for!(QueryAnswer), &out_dir);
    
    // State/Data structure schemas
    export_schema(&schema_for!(Poll), &out_dir);
}
