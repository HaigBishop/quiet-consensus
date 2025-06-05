// Type declarations for missing types in dependencies

// Fix for secretjs BinaryData type issue
declare global {
  type BinaryData = string | Uint8Array;
}

export {}; 