// BitcoinProvider.bitcoin-core.ts

import BitcoinCore from "bitcoin-core";

import { BlockchainProvider } from "./BlockchainProvider";


export class BitcoinCoreProvider implements BlockchainProvider {
    private connection: BitcoinCore;

    constructor(rpcUrl: string, rpcUser: string, rpcPassword: string) {
        this.connection = new BitcoinCore({
            host: rpcUrl,
            //port: 8332, // Port par défaut de Bitcoin RPC
            username: rpcUser,
            password: rpcPassword,
        });
    }


    getConnection() {
        return this.connection;
    }


    async getWalletAddress(): Promise<string> {
        return ''; // TODO
    }


    // Récupérer la balance d'une adresse en BTC
    async getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : BigInt> {
        try {
            const balance = await this.connection.command("getreceivedbyaddress", address); // or getbalance

            if (! formatDecimals) {
                return BigInt(balance * 1e8) as BigInt as T extends true ? never : BigInt;
            }

            return balance; // Balance en BTC

        } catch (error) {
            console.error("Error fetching Bitcoin balance:", error);
            return 0 as T extends true ? number : never;
        }
    }


    // Vérifier le statut d'une transaction
    async getTransactionStatus(txHash: string): Promise<string> {
        try {
            const transaction = await this.connection.command("gettransaction", txHash);
            return transaction.confirmations > 0 ? "Confirmed" : "Pending";
        } catch (error) {
            console.error("Error fetching Bitcoin transaction status:", error);
            return "Unknown";
        }
    }


    async executeTransaction(to: string, value: string): Promise<string> {
        return '';
    }


    getWrappedToken() {
        console.warn("Tokens are not supported on Bitcoin natively.");
        return '';
    }


    getWrappedTokenUsdPair() {
        console.warn("Tokens are not supported on Bitcoin natively.");
        return '';
    }


    // Les tokens ne sont pas natifs à Bitcoin
    async getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : BigInt> {
        console.warn("Tokens are not supported on Bitcoin natively.");
        return 0 as T extends true ? number : never;
    }


    async getTokensPairPrice(pairAddress: string): Promise<number> {
        console.warn("Tokens are not supported on Bitcoin natively.");
        return 0;
    }


    async getTokenPrice(tokenAddress: string): Promise<number> {
        console.warn("Tokens are not supported on Bitcoin natively.");
        return 0;
    }


    async swapTokens(inputMint: string, outputMint: string, amount: number, slippage: number, swapMode: string): Promise<string> {
        console.warn("Tokens are not supported on Bitcoin natively.");
        return '';
    }
}
