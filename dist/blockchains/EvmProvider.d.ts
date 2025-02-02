import { JsonRpcProvider, Wallet } from "ethers";
import { BlockchainProvider } from "./BlockchainProvider";
export type EvmChainName = keyof typeof rpcUrls;
declare const rpcUrls: {
    ethereum: string;
    bsc: string;
    fantom: string;
    polygon: string;
    avalanche: string;
    base: string;
    arbitrum: string;
    optimism: string;
};
export declare class EvmProvider implements BlockchainProvider {
    private connection;
    private signer;
    private chainName;
    constructor(chainName: EvmChainName, rpcUrl?: string, privateKey?: string);
    getConnection(): JsonRpcProvider;
    getWalletAddress(): Promise<string>;
    getWallet(): Promise<Wallet | null>;
    getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;
    executeTransaction(to: string, value: string, data?: string): Promise<string>;
    getTransactionStatus(txHash: string): Promise<string>;
    getWrappedToken(): string;
    getWrappedTokenUsdPair(): string;
    getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    getTokensPairPrice(pairAddress: string, inverseAssets?: boolean): Promise<number>;
    swapTokens(buyToken: string, sellToken: string, amountIn: bigint, slippage: number, swapMode: string): Promise<string>;
}
export {};
