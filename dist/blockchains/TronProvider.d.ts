import { TronWeb } from "tronweb";
import { BlockchainProvider } from "./BlockchainProvider";
export declare class TronProvider implements BlockchainProvider {
    private connection;
    private signer;
    constructor(rpcUrl?: string, privateKey?: string);
    getConnection(): TronWeb;
    getWalletAddress(): Promise<string>;
    getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : BigInt>;
    executeTransaction(to: string, value: string): Promise<string>;
    getTransactionStatus(txHash: string): Promise<string>;
    getWrappedToken(): string;
    getWrappedTokenUsdPair(): string;
    getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : BigInt>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    getTokensPairPrice(pairAddress: string): Promise<number>;
    swapTokens(inputMint: string, outputMint: string, amount: number, slippage: number, swapMode: string): Promise<string>;
}
