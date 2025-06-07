/*
contract.rs

Defines the entry points of the contract

See `polling-contract-design.md` for more details.
*/

// Imports
use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, StdError, CanonicalAddr, to_binary, WasmQuery, QueryRequest,
};
use serde::{Deserialize, Serialize};
use secret_toolkit::permit::Permit;
use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg, QueryWithPermit, QueryAnswer};
use crate::state::{SCT_CONTRACT_ADDRESS, SCT_CODE_HASH, POLL_COUNT, POLLS, VOTES, Poll};
use sha2::{Sha256, Digest};
use hex;






// Instantiate Message ---------------------------------------------------------------------

// instantiate is the constructor for the contract it takes four parameters:
//    deps - has the external dependencies for the contract including Storage which provides the functions to get, set, and remove values in storage, and Api which is a collection of callbacks to system functions defined outside of the wasm modules.
//    env - provides environment information about the block, the signed transaction, and the contract being executed.
//    info - a MessageInfo that has information about the sender of the transaction and any funds (e.g. SCRT) that might have been sent with the message.
//    msg - an InstantiateMsg as defined in msg.rs

#[entry_point]
pub fn instantiate( deps: DepsMut, _env: Env, _info: MessageInfo, msg: InstantiateMsg) -> StdResult<Response> {

    // Set the SCT contract address and code hash
    let sct_contract_address = deps.api.addr_canonicalize(msg.sct_contract_address.as_str())?;
    SCT_CONTRACT_ADDRESS.save(deps.storage, &sct_contract_address)?;
    SCT_CODE_HASH.save(deps.storage, &msg.sct_code_hash)?;

    // Set the poll count to 0
    POLL_COUNT.save(deps.storage, &0u32)?;

    // POLLS Keymap is empty by default, no initialization needed
    // VOTES Keymap is empty by default, no initialization needed

    Ok(Response::default())
}








// Execute Messages ---------------------------------------------------------------------

// execute is the main entry point for messages that can modify contract state
// It matches on the ExecuteMsg type and calls the appropriate handler function

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    match msg {
        // Create poll 
        // (any user)
        ExecuteMsg::MakePoll { title, description, options } => {
            try_make_poll(deps, env, title, description, options)
        }
        // Cast vote 
        // (only SCT holders)
        ExecuteMsg::CastVote { poll_id, option_idx, sct_viewing_key } => {
            try_cast_vote(deps, info, poll_id, option_idx, sct_viewing_key)
        }
    }
}

// try_make_poll creates a new poll with the given title, description, and options
// It generates a unique poll_id using SHA-256 hash of title+options
pub fn try_make_poll(
    deps: DepsMut,
    env: Env,
    title: String,
    description: String,
    options: Vec<String>,
) -> StdResult<Response> {
    
    // Generate poll_id
    let poll_id = generate_poll_id(&title, &options);
    
    // Validate the poll
    validate_poll(&title, &description, &options, &poll_id, deps.as_ref())?;
    
    // Create the poll
    let tally_size = options.len();
    let poll = Poll {
        poll_id: poll_id.clone(),
        title,
        description,
        created_at: env.block.time,
        options,
        tally: vec![0; tally_size], // Initialize tally with zeros
    };
    
    // Save the poll
    POLLS.insert(deps.storage, &poll_id, &poll)?;
    
    // Increment poll count
    let current_count = POLL_COUNT.load(deps.storage)?;
    POLL_COUNT.save(deps.storage, &(current_count + 1))?;
    
    Ok(Response::new().add_attribute("action", "make_poll").add_attribute("poll_id", poll_id))
}

// try_cast_vote allows a user with an SCT to vote on an existing poll
// It checks for SCT ownership, prevents double voting, and updates the tally
pub fn try_cast_vote(
    deps: DepsMut,
    info: MessageInfo,
    poll_id: String,
    option_idx: u32,
    sct_viewing_key: String,
) -> StdResult<Response> {
    
    let sender_canonical = deps.api.addr_canonicalize(info.sender.as_str())?;
    
    // Check if user owns an SCT
    match address_owns_sct(deps.as_ref(), &sender_canonical, &sct_viewing_key) {
        Ok(true) => {
            // User has SCT, continue with voting
        }
        Ok(false) => {
            // This case should not happen with the new implementation
            return Err(StdError::generic_err("SCT check returned false unexpectedly"));
        }
        Err(e) => {
            // User doesn't have SCT or query failed
            return Err(e);
        }
    }
    
    // Validate the vote
    validate_vote(&poll_id, option_idx, deps.as_ref())?;
    
    // Create vote key (poll_id + hashed voter address)
    let vote_key = format!("{}_{}", poll_id, hex::encode(sender_canonical.as_slice()));
    
    // Check if user has already voted
    if VOTES.contains(deps.storage, &vote_key) {
        return Err(StdError::generic_err("You have already voted on this poll"));
    }
    
    // Record the vote
    VOTES.insert(deps.storage, &vote_key, &option_idx)?;
    
    // Update the poll tally
    let mut poll = POLLS.get(deps.storage, &poll_id)
        .ok_or_else(|| StdError::generic_err("Poll does not exist"))?;
    poll.tally[option_idx as usize] += 1;
    POLLS.insert(deps.storage, &poll_id, &poll)?;
    
    Ok(Response::new()
        .add_attribute("action", "cast_vote")
        .add_attribute("poll_id", poll_id)
        .add_attribute("option_idx", option_idx.to_string()))
}







// Query Messages ---------------------------------------------------------------------

#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        // Get all polls
        // (anyone)
        QueryMsg::GetPolls {} => query_get_polls(deps),
        // Get number of polls
        // (anyone)
        QueryMsg::GetNumPolls {} => query_get_num_polls(deps),
        // Handle permit-based queries
        // (anyone, but requires permit)
        QueryMsg::WithPermit { permit, query } => permit_queries(deps, env, permit, query),
    }
}

// Handle permit-based queries
fn permit_queries(
    deps: Deps,
    env: Env,
    permit: Permit,
    query: QueryWithPermit,
) -> StdResult<Binary> {
    let account = secret_toolkit::permit::validate(
        deps,
        "revoked_permits",
        &permit,
        env.contract.address.to_string(),
        None,
    )?;

    // (permit validated!)

    // Canonicalize the account address
    let canonical_account = deps.api.addr_canonicalize(account.as_str())?;

    // Process query
    match query {
        QueryWithPermit::GetMyVote { poll_id } => query_get_my_vote(deps, &canonical_account, &poll_id)
    }
}

// Query all polls  
fn query_get_polls(
    deps: Deps
) -> StdResult<Binary> {
    
    // Check if iterator is available, if not return empty vec
    let polls: Vec<Poll> = match POLLS.iter(deps.storage) {
        Ok(iter) => iter
            .filter_map(|item| item.ok().map(|(_, poll)| poll))
            .collect(),
        Err(_) => Vec::new(), // Return empty vector if iterator fails
    };
    
    to_binary(&QueryAnswer::GetPolls { polls })
}

// Query number of polls
fn query_get_num_polls(
    deps: Deps
) -> StdResult<Binary> {
    
    let num_polls = POLL_COUNT.load(deps.storage)?;
    
    to_binary(&QueryAnswer::GetNumPolls { num_polls })
}

// Query user's vote on a specific poll (requires permit authentication)
fn query_get_my_vote(
    deps: Deps, 
    requesting_account: &CanonicalAddr, 
    poll_id: &str
) -> StdResult<Binary> {
    
    let vote = get_user_vote(deps, poll_id, requesting_account)?;
    
    to_binary(&QueryAnswer::GetMyVote { vote })
}










// Helper Functions ---------------------------------------------------------------------

// Helper function to generate a unique poll_id
fn generate_poll_id(title: &str, options: &[String]) -> String {
    
    let mut hasher = Sha256::new();
    hasher.update(title.as_bytes());
    for option in options {
        hasher.update(option.as_bytes());
    }
    let result = hasher.finalize();
    hex::encode(result)
}

// SNIP-721 query structures
#[derive(Serialize, Deserialize)]
struct TokensQuery {
    tokens: TokensQueryParams,
}

#[derive(Serialize, Deserialize)]
struct TokensQueryParams {
    owner: String,
    viewing_key: String,
    limit: Option<u32>,
}

#[derive(Serialize, Deserialize)]
struct TokensResponse {
    token_list: TokenList,
}

#[derive(Serialize, Deserialize)]
struct TokenList {
    tokens: Vec<String>,
}

// Helper function to check if an SCT is owned by the given address
fn address_owns_sct(
    deps: Deps,
    address: &CanonicalAddr,
    viewing_key: &str,
) -> StdResult<bool> {
    let sct_contract_address = SCT_CONTRACT_ADDRESS.load(deps.storage)?;
    let sct_code_hash = SCT_CODE_HASH.load(deps.storage)?;
    
    // Convert canonical address back to human readable format
    let human_address = deps.api.addr_humanize(address)?;
    
    // Create the proper SNIP-721 tokens query
    let query_msg = TokensQuery {
        tokens: TokensQueryParams {
            owner: human_address.to_string(),
            viewing_key: viewing_key.to_string(),
            limit: Some(30),
        },
    };
    
    let query_request = QueryRequest::Wasm(WasmQuery::Smart {
        contract_addr: deps.api.addr_humanize(&sct_contract_address)?.to_string(),
        code_hash: sct_code_hash,
        msg: to_binary(&query_msg)?,
    });
    
    // Execute the query
    let query_result: Result<TokensResponse, _> = deps.querier.query(&query_request);
    
    match query_result {
        Ok(response) => {
            // Check if user has any tokens
            let has_tokens = !response.token_list.tokens.is_empty();
            if has_tokens {
                Ok(true)
            } else {
                // Return error instead of false to make it explicit
                Err(StdError::generic_err("No SCT tokens found for this address"))
            }
        }
        Err(e) => {
            // If query fails (e.g., invalid viewing key), return specific error
            Err(StdError::generic_err(format!("SCT query failed: {}", e)))
        }
    }
}



// Helper function to check if poll is valid
// Fails if:
// - Invalid poll contents 
//   - <2 options or >8 options
//   - empty title or description
//   - title length > 100 chars
//   - description length > 500 chars
// - The resulting poll_id already taken (same title+options)
fn validate_poll(
    title: &str,
    description: &str,
    options: &[String],
    poll_id: &str,
    deps: Deps,
) -> StdResult<()> {
    // Check if options are valid
    if options.len() < 2 || options.len() > 8 {
        return Err(StdError::generic_err("Invalid number of options (min 2, max 8)"));
    }
    // Check if title and description are valid
    if title.is_empty() || description.is_empty() {
        return Err(StdError::generic_err("Title and description cannot be empty"));
    }
    if title.len() > 100 {
        return Err(StdError::generic_err("Title too long (max 100 chars)"));
    }
    if description.len() > 500 {
        return Err(StdError::generic_err("Description too long (max 500 chars)"));
    }
    // Check if poll_id already taken (same title+options)
    if POLLS.contains(deps.storage, &poll_id.to_string()) {
        return Err(StdError::generic_err("Poll ID already taken (same title and options)"));
    }
    Ok(())
}


// Helper function to check is a vote is valid
// Fails if:
// - Invalid option index
// - Poll does not exist
// 
// This function does NOT check if the user has already voted, that is done in try_cast_vote
fn validate_vote(
    poll_id: &str,
    option_idx: u32,
    deps: Deps,
) -> StdResult<()> {
    
    // Check if poll exists
    let poll = POLLS.get(deps.storage, &poll_id.to_string())
        .ok_or_else(|| StdError::generic_err("Poll does not exist"))?;
    
    // Check if option index is valid
    if option_idx as usize >= poll.options.len() {
        return Err(StdError::generic_err("Invalid option index"));
    }
    
    Ok(())
}


// Helper function to get a user's vote on a poll
// This function assumes that the user has voted but NOT that the user has voted
// Returns None if user has not voted
fn get_user_vote(
    deps: Deps,
    poll_id: &str,
    address: &CanonicalAddr,
) -> StdResult<Option<u32>> {
    
    // Create vote key (poll_id + hashed voter address)
    let vote_key = format!("{}_{}", poll_id, hex::encode(address.as_slice()));
    
    // Get the vote if it exists
    let vote = VOTES.get(deps.storage, &vote_key);
    
    Ok(vote)
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::mock_dependencies;
    
    #[test]
    fn test_generate_poll_id() {
        let title = "Test Poll";
        let options = vec!["Option A".to_string(), "Option B".to_string()];
        let poll_id = generate_poll_id(title, &options);
        
        // Poll ID should be deterministic
        let poll_id2 = generate_poll_id(title, &options);
        assert_eq!(poll_id, poll_id2);
        
        // Poll ID should be different for different inputs
        let options_different = vec!["Option X".to_string(), "Option Y".to_string()];
        let poll_id3 = generate_poll_id(title, &options_different);
        assert_ne!(poll_id, poll_id3);
        
        // Poll ID should be a valid hex string (64 characters for SHA256)
        assert_eq!(poll_id.len(), 64);
        assert!(poll_id.chars().all(|c| c.is_ascii_hexdigit()));
    }
    
    #[test]
    fn test_validate_poll_valid() {
        let deps = mock_dependencies();
        let result = validate_poll(
            "Valid Title",
            "Valid description",
            &vec!["Option A".to_string(), "Option B".to_string()],
            "unique_poll_id",
            deps.as_ref(),
        );
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_validate_poll_invalid_options() {
        let deps = mock_dependencies();
        
        // Too few options
        let result = validate_poll(
            "Valid Title",
            "Valid description",
            &vec!["Only Option".to_string()],
            "unique_poll_id",
            deps.as_ref(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Invalid number of options"));
        
        // Too many options
        let too_many_options: Vec<String> = (1..=9).map(|i| format!("Option {}", i)).collect();
        let result = validate_poll(
            "Valid Title",
            "Valid description",
            &too_many_options,
            "unique_poll_id",
            deps.as_ref(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Invalid number of options"));
    }
    
    #[test]
    fn test_validate_poll_empty_fields() {
        let deps = mock_dependencies();
        
        // Empty title
        let result = validate_poll(
            "",
            "Valid description",
            &vec!["Option A".to_string(), "Option B".to_string()],
            "unique_poll_id",
            deps.as_ref(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Title and description cannot be empty"));
        
        // Empty description
        let result = validate_poll(
            "Valid Title",
            "",
            &vec!["Option A".to_string(), "Option B".to_string()],
            "unique_poll_id",
            deps.as_ref(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Title and description cannot be empty"));
    }
    
    #[test]
    fn test_validate_poll_field_lengths() {
        let deps = mock_dependencies();
        
        // Title too long
        let long_title = "a".repeat(101);
        let result = validate_poll(
            &long_title,
            "Valid description",
            &vec!["Option A".to_string(), "Option B".to_string()],
            "unique_poll_id",
            deps.as_ref(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Title too long"));
        
        // Description too long
        let long_description = "a".repeat(501);
        let result = validate_poll(
            "Valid Title",
            &long_description,
            &vec!["Option A".to_string(), "Option B".to_string()],
            "unique_poll_id",
            deps.as_ref(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Description too long"));
    }
}

