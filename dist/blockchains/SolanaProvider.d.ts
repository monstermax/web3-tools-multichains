import { Connection } from "@solana/web3.js";
import { SwapMode } from '@jup-ag/api';
import { BlockchainProvider } from "./BlockchainProvider";
export declare class SolanaProvider implements BlockchainProvider {
    private connection;
    private signer;
    constructor(rpcUrl?: string, privateKey?: string);
    getConnection(): Connection;
    getWalletAddress(): Promise<string>;
    getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : BigInt>;
    executeTransaction(to: string, value: string, data?: string): Promise<string>;
    getTransactionStatus(txHash: string): Promise<'processed' | 'confirmed' | 'finalized' | 'unknown'>;
    getWrappedToken(): string;
    getWrappedTokenUsdPair(): string;
    getTokenBalance<T extends boolean>(address: string, baseTokenddress: string, formatDecimals?: T): Promise<T extends true ? number : BigInt>;
    private parseTokenBalance;
    getTokenPrice(tokenAddress: string, inverseAssets?: boolean): Promise<number>;
    getTokensPairPrice(pairAddress: string, inverseAssets?: boolean): Promise<number>;
    private getTokenDecimals;
    swapTokens(inputMint: string, outputMint: string, amount: number, slippageBps?: number, swapMode?: SwapMode): Promise<string>;
}
