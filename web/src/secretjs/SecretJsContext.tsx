/*

[OLD NEED TO REPLACE MOST OF THIS]

React context provider for Secret Network integration.
Manages wallet connection, Secret.js client initialization, and authentication with Keplr wallet.
*/

import {
    createContext,
    useState,
} from "react";
import type {
    ReactNode,
    Dispatch,
    SetStateAction,
    FC,
} from "react";
import { SecretNetworkClient } from "secretjs";

// Which blockchain to use (probably testnet)
const SECRET_CHAIN_ID = "pulsar-3";
const SECRET_LCD = "https://pulsar.lcd.secretnodes.com";

// SCT status enum
enum SCTStatus {
    LOADING = 'loading',
    HAS_SCT = 'has_sct', 
    NO_SCT = 'no_sct',
    ERROR = 'error'
}

interface SecretJsContextType {
    secretJs: SecretNetworkClient | null;
    setSecretJs: Dispatch<SetStateAction<SecretNetworkClient | null>>;
    secretAddress: string;
    setSecretAddress: Dispatch<SetStateAction<string>>;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    sctStatus: SCTStatus | null;
    setSctStatus: Dispatch<SetStateAction<SCTStatus | null>>;
    checkSCTStatus: () => Promise<void>;
}

// Create the context with undefined default (will be provided by the provider)
const SecretJsContext = createContext<SecretJsContextType | null>(null);

// Props for the provider component
interface SecretJsContextProviderProps {
    children: ReactNode;
}

const SecretJsContextProvider: FC<SecretJsContextProviderProps> = ({ children }) => {
    const [secretJs, setSecretJs] = useState<SecretNetworkClient | null>(null);
    const [secretAddress, setSecretAddress] = useState<string>("");
    const [sctStatus, setSctStatus] = useState<SCTStatus | null>(null);

    async function setupKeplr(
        setSecretJs: Dispatch<SetStateAction<SecretNetworkClient | null>>,
        setSecretAddress: Dispatch<SetStateAction<string>>
    ): Promise<void> {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        while (
            !window.keplr ||
            !window.getEnigmaUtils ||
            !window.getOfflineSignerOnlyAmino
        ) {
            await sleep(50);
        }

        await window.keplr.enable(SECRET_CHAIN_ID);

        window.keplr.defaultOptions = {
            sign: {
                preferNoSetFee: false,
                disableBalanceCheck: true,
            },
        };


        const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID);
        const accounts = await keplrOfflineSigner.getAccounts();

        const secretAddress = accounts[0].address;

        const secretJs = new SecretNetworkClient({
            url: SECRET_LCD,
            chainId: SECRET_CHAIN_ID,
            wallet: keplrOfflineSigner,
            walletAddress: secretAddress,
            encryptionUtils: window.getEnigmaUtils(SECRET_CHAIN_ID),
        });

        setSecretAddress(secretAddress);
        setSecretJs(secretJs);
    }

    async function connectWallet(): Promise<void> {
        try {
            if (!window.keplr) {
                console.log("install keplr!");
            } else {
                await setupKeplr(setSecretJs, setSecretAddress);
                localStorage.setItem("keplrAutoConnect", "true");
                console.log(secretAddress);
            }
        } catch (err: unknown) {
            let message = "An error occurred while connecting to the wallet. Please try again.";
            if (err instanceof Error) {
                message = `${message} Details: ${err.message}`;
            }
            console.error("Error connecting to wallet:", err);
            alert(message);
        }
    }

    function disconnectWallet(): void {
        // reset secretjs and secretAddress
        setSecretAddress("");
        setSecretJs(null);
        setSctStatus(null);

        // disable auto connect
        localStorage.setItem("keplrAutoConnect", "false");

        // console.log for success
        console.log("Wallet disconnected!");
    }

    async function checkSCTStatus(): Promise<void> {
        if (!secretJs || !secretAddress) {
            setSctStatus(null);
            return;
        }

        setSctStatus(SCTStatus.LOADING);
        console.log("Checking SCT status...");
        
        // Note: The actual SCT checking logic is implemented in the SCTStatusBox component
        // since it has access to the SecretJsFunctions hook. This function is kept for
        // consistency and potential future use.
    }

    return (
        <SecretJsContext.Provider
            value={{
                secretJs,
                setSecretJs,
                secretAddress,
                setSecretAddress,
                connectWallet,
                disconnectWallet,
                sctStatus,
                setSctStatus,
                checkSCTStatus,
            }}
        >
            {children}
        </SecretJsContext.Provider>
    );
};

// Exporting context, provider, and a constant.
// The constant export triggers a react-refresh warning, but for this project,
// we'll keep it here for simplicity and disable the warning for this line.
// eslint-disable-next-line react-refresh/only-export-components
export { SecretJsContext, SecretJsContextProvider, SECRET_CHAIN_ID, SCTStatus };
