/*
TypeScript environment and global type declarations.
Extends the global Window interface for Keplr wallet integration and defines Vite environment variables.
*/

/// <reference types="vite/client" />

import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
    // This extends the global Window interface with Keplr's types.
    // Disabled because this is the standard way to augment global types for Keplr,
    // even if the interface itself doesn't add new members directly.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Window extends KeplrWindow {}
}

interface ImportMetaEnv {
    readonly POLLING_CONTRACT_ADDR: string;
    readonly POLLING_CONTRACT_CODE_HASH: string;
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv;
}