
export interface BlockchainProvider {
    getConnection(): any;

    // Wallets/Accounts
    getWalletAddress(): Promise<string>;
    getBalance(address: string, formatDecimals: boolean): Promise<number>;

    // Transactions
    getTransactionStatus(txHash: string): Promise<string>;

    // Defi
    getTokenBalance(address: string, tokenAddress: string, formatDecimals: boolean): Promise<number>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    swapTokens(inputMint: string, outputMint: string, amount: number, slippage?: number, swapMode?: string): Promise<string>
}

