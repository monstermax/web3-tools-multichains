import BitcoinCore from "bitcoin-core";
import { BlockchainProvider } from "./BlockchainProvider";
export declare class BitcoinCoreProvider implements BlockchainProvider {
    private connection;
    constructor(rpcUrl: string, rpcUser: string, rpcPassword: string);
    getConnection(): BitcoinCore;
    getWalletAddress(): Promise<string>;
    getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : BigInt>;
    getTransactionStatus(txHash: string): Promise<string>;
    executeTransaction(to: string, value: string): Promise<string>;
    getWrappedToken(): string;
    getWrappedTokenUsdPair(): string;
    getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : BigInt>;
    getTokensPairPrice(pairAddress: string): Promise<number>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    swapTokens(inputMint: string, outputMint: string, amount: number, slippage: number, swapMode: string): Promise<string>;
}
