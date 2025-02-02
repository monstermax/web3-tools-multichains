import TonWeb from "tonweb";
import { BlockchainProvider } from "./BlockchainProvider";
import { WalletV3ContractR2 } from "tonweb/dist/types/contract/wallet/v3/wallet-v3-contract-r2";
export declare class TonProvider implements BlockchainProvider {
    private connection;
    private privateKey;
    private signer;
    constructor(rpcUrl?: string, privateKey?: string);
    private initializeSigner;
    getConnection(): TonWeb;
    getWallet(): Promise<WalletV3ContractR2 | null>;
    getWalletAddress(): Promise<string>;
    getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;
    executeTransaction(to: string, value: string): Promise<string>;
    getTransactionStatus(txHash: string): Promise<string>;
    getWrappedToken(): string;
    getWrappedTokenUsdPair(): string;
    getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    getTokensPairPrice(pairAddress: string): Promise<number>;
    swapTokens(inputMint: string, outputMint: string, amount: bigint, slippage: number, swapMode: string): Promise<string>;
}
