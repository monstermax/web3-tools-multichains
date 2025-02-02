// BlockchainProvider.ts

import { BitcoinBlockstreamProvider } from "./BitcoinProvider.blockstream";
import { EvmChainName, EvmProvider } from "./EvmProvider";
import { SolanaProvider } from "./SolanaProvider";
import { TonProvider } from "./TonProvider";
import { TronProvider } from "./TronProvider";


export type ChainName = 
    | 'bitcoin'
    | 'ethereum' | 'bsc' | 'polygon' | 'fantom' | 'avalanche' | 'base'
    | 'solana'
    | 'ton'
    | 'tron'
;


export type BlockchainProviderOptions<chainName extends ChainName> = 
    chainName extends 'bitcoin' ? BitcoinBlockstreamProviderOptions :
    chainName extends 'ethereum' ? EvmProviderOptions :
    chainName extends 'solana' ? SolanaProviderOptions :
    chainName extends 'ton' ? TonProviderOptions :
    chainName extends 'tron' ? TronProviderOptions :
    never
;


export type BitcoinCoreProviderProviderOptions = {
    rpcUrl: string,
    rpcUser: string,
    rpcPassword: string,
}

export type BitcoinBlockstreamProviderOptions = {
    mnemonic?: string,
}

export type EvmProviderOptions = {
    chainName: ChainName & EvmChainName,
    rpcUrl?: string,
    privateKey?: string,
}

export type SolanaProviderOptions = {
    rpcUrl?: string,
    privateKey?: string,
}

export type TonProviderOptions = {
    rpcUrl?: string,
    privateKey?: string,
}

export type TronProviderOptions = {
    rpcUrl?: string,
    privateKey?: string,
}

export type BlockchainProviderReturn<chainName extends ChainName> = 
    chainName extends 'bitcoin' ? BitcoinBlockstreamProvider :
    chainName extends 'ethereum' ? EvmProvider :
    chainName extends 'solana' ? SolanaProvider :
    chainName extends 'ton' ? TonProvider :
    chainName extends 'tron' ? TronProvider :
    never
;


export interface BlockchainProvider {
    getConnection(): any;

    // Wallets/Accounts
    //formatPrice(decimals?: number): string;
    getWallet(): Promise<any | null>;
    getWalletAddress(): Promise<string>;
    getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;

    // Transactions
    executeTransaction(to: string, value: string, data?: string): Promise<string>;
    getTransactionStatus(txHash: string): Promise<string>;

    // Defi
    getWrappedToken(): string;
    getWrappedTokenUsdPair(): string;
    getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    getTokensPairPrice(pairAddress: string): Promise<number>;
    swapTokens(inputMint: string, outputMint: string, amount: bigint, slippage?: number, swapMode?: string): Promise<string>
}



export function getBlockchainProvider<chainName extends ChainName>(chainName: chainName, options?: BlockchainProviderOptions<chainName>): BlockchainProviderReturn<chainName> {
    switch (chainName) {
        case 'bitcoin':
            const optionsBitcoin = options as BitcoinBlockstreamProviderOptions;
            return new BitcoinBlockstreamProvider(optionsBitcoin?.mnemonic) as BlockchainProviderReturn<chainName>;

        case 'ethereum':
        case 'bsc':
        case 'polygon':
        case 'fantom':
        case 'avalanche':
        case 'base':
            const optionsEvm = options as EvmProviderOptions;
            return new EvmProvider(chainName as EvmChainName, optionsEvm?.rpcUrl, optionsEvm?.privateKey) as BlockchainProviderReturn<chainName>;

        case 'solana':
            const optionsSolana = options as SolanaProviderOptions;
            return new SolanaProvider(optionsSolana?.rpcUrl, optionsSolana?.privateKey) as BlockchainProviderReturn<chainName>;

        case 'ton':
            const optionsTon = options as TonProviderOptions;
            return new TonProvider(optionsTon?.rpcUrl, optionsTon?.privateKey) as BlockchainProviderReturn<chainName>;

        case 'tron':
            const optionsTron = options as TronProviderOptions;
            return new TronProvider(optionsTron?.rpcUrl, optionsTron?.privateKey) as BlockchainProviderReturn<chainName>;

        default:
            throw new Error(`chain ${chainName} not supported`);
    }
}
