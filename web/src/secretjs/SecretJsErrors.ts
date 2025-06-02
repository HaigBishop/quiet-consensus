/*
Custom error classes for Secret.js operations.
Defines specific error types for wallet and query operations.
*/

class WalletError extends Error {
    constructor(message: string) {
        super(message); 
        this.name = "WalletError"; 
    }
}

class QueryError extends Error {
    constructor(message: string) {
        super(message); 
        this.name = "QueryError"; 
    }
}

export { WalletError, QueryError, };
