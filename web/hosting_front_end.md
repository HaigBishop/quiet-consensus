## How to host the quiet consensus front end locally

1. Move to `web/`
    ```bash
    cd ~/Repos/quiet-consensus/web/
    ```

2. Ensure contract addresses and hashes are set in `web/src/config.ts` like:
    ```
    export const POLLING_CONTRACT_CODE_HASH = "ae155c48ceb59d415e7b6094ce4e102275cf8016661c96ad396c40a4d723b4f4"; 
    export const POLLING_CONTRACT_ADDRESS = "secret1e8q73q6mcmuxxwn7n3r3c0eg3442jqcdq93ys0";
    export const SCT_CONTRACT_ADDRESS = "secret13vvh7vhrkkwq7jj0xvcjujj0hz722074pt6mnm";
    ```
    
3. Host locally
    ```bash
    npm install
    npm run dev
    ```
