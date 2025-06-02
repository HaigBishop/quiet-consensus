/*

[OLD NEED TO DELETE THIS FILE]

The (PREVIOUS) main user interface component.
Provides UI controls for setting up, starting, bidding on, and querying auctions on Secret Network.
*/

import { useContext, useState } from "react";
import { SecretJsFunctions } from "./secretjs/SecretJsFunctions";
import { SecretJsContext } from "./secretjs/SecretJsContext";
import { WalletIcon } from "@heroicons/react/24/outline";

const AuctionUI = () => {
    const {
        set_auction,
        start_auction,
        bid,
        withraw,
        query_auction_info,
        query_get_secret,
    } = SecretJsFunctions();
    const { connectWallet } = useContext(SecretJsContext)!;

    const [secret, setSecret] = useState("");
    const [minimumBid, setMinimumBid] = useState("0");
    const [seconds, setSeconds] = useState("0");
    const [bidAmount, setBidAmount] = useState("0");
    const [queryResult, setQueryResult] = useState<string>("");

    const handle = async (fn: () => Promise<unknown>) => {
        try {
            const res = await fn();
            if (res !== undefined) {
                setQueryResult(JSON.stringify(res, null, 2));
            }
        } catch (err: unknown) {
            let message = "Unknown error";
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            alert(message);
        }
    };

    return (
        <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
            <h2>Connect wallet</h2>
            <div>
                <WalletIcon
                    onClick={connectWallet}
                    style={{ width: "48px", height: "48px", color: "black", cursor: "pointer" }}
                />
            </div>
            <h2>Auction Controls</h2>

            <div style={{ marginBottom: "1rem" }}>
                <h4>Set Auction</h4>
                <div>
                    <label>
                        Secret:
                        <input
                            type="text"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Minimum Bid (uscrt):
                        <input
                            type="number"
                            value={minimumBid}
                            onChange={(e) => setMinimumBid(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Duration (seconds):
                        <input
                            type="number"
                            value={seconds}
                            onChange={(e) => setSeconds(e.target.value)}
                        />
                    </label>
                </div>
                <button
                    onClick={() =>
                        handle(() =>
                            set_auction(secret, BigInt(minimumBid), parseInt(seconds))
                        )
                    }
                >
                    Set Auction
                </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => handle(start_auction)}>Start Auction</button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <h4>Bid</h4>
                <div>
                    <label>
                        Bid Amount (uscrt):
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                        />
                    </label>
                </div>
                <button onClick={() => handle(() => bid(BigInt(bidAmount)))}>
                    Bid
                </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => handle(withraw)}>Withdraw</button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => handle(query_auction_info)}>
                    Query Auction Info
                </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => handle(query_get_secret)}>Query Secret</button>
            </div>

            <div>
                <h4>Response:</h4>
                <pre
                    style={{
                        backgroundColor: "#f9f9f9",
                        border: "1px solid #ccc",
                        padding: "1rem",
                        maxHeight: "300px",
                        overflowY: "auto",
                    }}
                >
                    {queryResult}
                </pre>
            </div>
        </div>
    );
};

export default AuctionUI;
