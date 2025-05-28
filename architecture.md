# Quiet Consensus – System Architecture  
## 1 Purpose  
Deliver a single-page website that lets any visitor **view**, **create**, and **vote** in blockchain-backed polls while keeping each ballot provably human and group-scoped. No central server, no database, only the page and the chain. 

---

## 2 Component List  

### 2.1 Static Site  
* **index.html** – container for the whole app (root div).  
* **app.js** – all application logic written in modern JavaScript.  
* **style.css** – very light CSS; aim for readability, not eye-candy.  
* **asset/…** – branding images, favicon.

> **Why static?** We avoid a traditional backend. The page can be served from any cheap object-storage bucket (e.g. GitHub Pages, Cloudflare Pages, Netlify). Browser ↔ blockchain only.

### 2.2 Wallet Integration  
* **Keplr** (browser extension; a “wallet” is a secure store for the user’s private key).  
* A small helper in **wallet.js** that checks if Keplr is installed, prompts connect, and exposes `signAndBroadcast(tx)`.

### 2.3 Blockchain Gateway Layer  
* **secretjs** – JavaScript library that speaks the Secret Network RPC+gRPC endpoints (remote procedure call nodes run by the chain).  
* Inside **chain.js** we wrap commonly-used calls:

  ```js
  export async function viewPolls() { ... }
  export async function createPoll(pollObj) { ... }
  export async function castVote(pollId, option) { ... }


Each wrapper adds helpful browser console logging so debugging stays painless.

------

## 3 On-chain Contracts

### 3.1 Polling Contract

Holds every poll, its options, tallies, and a record of who voted (only hashes are stored so actual voter addresses remain hidden by Secret Network’s encryption feature).

### 3.2 NTSC (Now-transferable Soulbound Credential) Contract

Mint-once, non-tradeable token proving “one human of group X”. Required to call `cast_vote` in the polling contract. 

### 3.3 NTSC Admin Account

The key controlled by an off-chain “issuing organisation” that mints NTSCs after manual identity checks. It never leaves cold storage except when signing mint transactions.

------

## 4 Data Structures

Defines the core data structures used within the system, particularly those stored on-chain or passed between client and chain.


### 4.1 Poll

All the stuff you store about a poll itself.

* `pollId` (String)
  – unique identifier (e.g. SHA-256 of creator+timestamp).
* `title` (String)
  – a short summary (“Best NZ native bird”).
* `description` (String)
  – full question or context.
* `creator` (String)
  – soulbound credential holder who made it (hashed for privacy).
* `createdAt` (Timestamp)
  – when it went live.
* `options` (List of Option objects)
  – see 4.2 below.
* `tally` (List of Integers)
  – count per option index.
* `allowMultiple` (Boolean)
  – can someone vote for more than one option?
* `eligibleGroups` (List of Strings)
  – e.g. \[“biology-club”, “staff”] — only holders of those NTSCs may vote.
* `metadata` (Map\<String, String>)
  – any extra JSON-stringified fields you dream up (e.g. `{"theme":"dark"}`).

### 4.2 Option

Defines one choice within a poll.

* `optionId` (String)
  – unique within its poll (e.g. UUID or index).
* `text` (String)
  – what the voter sees.

### 4.3 VoteRecord

Keeps track of who voted what (encrypted on-chain).

* `pollId` (String)
* `optionIds` (List of Strings)
  – in case of multi-select polls.
* `voterHash` (String)
  – hash of soulbound credential, salted per poll for privacy.
* `castAt` (Timestamp)


### 4.4 SoulboundCredential (NTSC)

* `tokenId` (String)
  – unique ID (e.g. SHA-256 of wallet+group+timestamp).
* `ownerAddress` (String)
  – wallet address that owns this credential.
* `groupIds` (List of Strings)
  – the groups this credential proves membership in (e.g. "biology-club").
* `issuerId` (String)
  – ID of the off-chain organisation that minted this.
* `issuedAt` (Timestamp)
  – when the credential was issued.

(this is a high-level conceptual structure, not neccesarily true to the NFT's structue. To be used to guide contract design.)


------

## 5 Client-side Data Flow

1. **Boot** - user opens webpage, `init()` runs:
   - Checks Keplr → if absent, display install link.
   - Loads current polls via `viewPolls()` and renders.
2. **Creating a poll**:
   - User fills form → `createPoll()` signs and broadcasts a `create_poll` message.
   - Chain emits event → front-end listens via WebSocket and refreshes list.
3. **Voting**:
   - Button click → `castVote()`; chain rejects the tx if the wallet lacks an NTSC.
   - Upon success, the UI instantly increments the displayed tally via optimistic update, then confirms when event arrives.
4. **Realtime updates** (nice-to-have):
   - A lightweight WebSocket subscribes to `new_poll` and `vote_cast` events so all open pages stay in sync.

------

## 6 Credential Issuance Flow (off-chain + on-chain)

1. Person meets issuer in real life, shows ID.
2. Issuer searches internal spreadsheet to ensure “not issued yet”.
3. Issuer opens a small React admin page, pastes user wallet address, hits **Mint**.
4. Admin page signs a mint transaction with the cold key (hardware wallet connected once).
5. After Tx confirmation, NTSC appears in the user’s Keplr wallet; issuer deletes the address from local machine.
6. Person can now vote exactly once per poll.

> **Toy-project simplification**: skip fancy hardware connections – a plain text mnemonic is fine while prototyping on the test net.

------

## 7 Security & Privacy Notes

- All votes encrypted by chain’s built-in “secret contracts” (code executes inside a trusted execution environment; node operators cannot read plaintext).
- **Rate-limiting**: the NTSC check already enforces one-person one-vote.
- **Front-end integrity**: publish a hash (SHA-256) of `app.js` in the README so users can verify they are loading the approved build.

------

## 8 Build & Deployment

1. `npm install` – installs `vite`, `secretjs`, `eslint`.
2. `npm run dev` – hot-reload for local hacking against a Secret Network testnet.
3. `npm run build && npm run preview` – produces minified static files.
4. Push `dist/` to a branch called `gh-pages` or drop into any static host.

A one-page **README.md** in the repo summarizes this for new collaborators.



