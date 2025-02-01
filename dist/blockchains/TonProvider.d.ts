import TonWeb from "tonweb";
import { BlockchainProvider } from "./BlockchainProvider";
export declare class TonProvider implements BlockchainProvider {
    private connection;
    private privateKey;
    private signer;
    constructor(rpcUrl?: string, privateKey?: string);
    private initializeSigner;
    getConnection(): TonWeb;
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
