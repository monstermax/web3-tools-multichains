import { BlockchainProvider } from "./BlockchainProvider";
export declare class BitcoinBlockstreamProvider implements BlockchainProvider {
    private rpcUrl;
    private network;
    private keyPair;
    constructor(mnemonic?: string);
    getConnection(): null;
    getWallet(): Promise<null>;
    getWalletAddress(): Promise<string>;
    getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;
    executeTransaction(to: string, value: string): Promise<string>;
    getTransactionStatus(txHash: string): Promise<string>;
    getWrappedToken(): string;
    getWrappedTokenUsdPair(): string;
    getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;
    getTokensPairPrice(pairAddress: string): Promise<number>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    swapTokens(inputMint: string, outputMint: string, amount: bigint, slippage: number, swapMode: string): Promise<string>;
}
