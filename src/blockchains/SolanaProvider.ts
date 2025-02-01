// SolanaProvider.ts

import bs58 from "bs58";

import { Connection, PublicKey, Keypair, SignatureResult, Transaction } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { SwapMode } from '@jup-ag/api';

import { BlockchainProvider } from "./BlockchainProvider";
import { getTransactionPriorityFeeEstimate } from './solana/solana';
import { addTransactionFees, checkTransactionStatus, confirmTransaction, executeLegacyTransaction, sendTransaction } from './solana/transaction.utils';
import { buildAndSignSwapTransaction, getJupiterClient, getQuoteApi, getSwapApi } from './solana/jupiter';



export class SolanaProvider implements BlockchainProvider {
    private connection: Connection;
    private signer: Keypair | null;

    constructor(rpcUrl?: string, privateKey?: string) {
        rpcUrl = rpcUrl || 'https://api.mainnet-beta.solana.com';
        this.connection = new Connection(rpcUrl, "confirmed");

        this.signer = privateKey ? Keypair.fromSecretKey(bs58.decode(privateKey)) : null;
    }

    getConnection() {
        return this.connection;
    }


    async getWalletAddress(): Promise<string> {
        if (!this.signer) {
            throw new Error(`missing signer`);
        }

        return this.signer.publicKey.toBase58();
    }


    async getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : BigInt> {
        const publicKey = new PublicKey(address);

        const balance = await this.connection.getBalance(publicKey);

        if (!formatDecimals) {
            return BigInt(balance) as BigInt as T extends true ? never : BigInt;
        }

        return balance / 1e9 as T extends true ? number : never; // Convert lamports to SOL
    }


    async executeTransaction(to: string, value: string, data: string = "0x"): Promise<string> {
        if (! this.signer) {
            throw new Error(`missing signer`);
        }

        const transaction = new Transaction;
        const txId = await executeLegacyTransaction(this.connection, this.signer, transaction);

        const result = await checkTransactionStatus(this.connection, txId);

        if (result.err) {
            throw new Error(result.err.toString());
        }

        return txId;
    }


    async getTransactionStatus(txHash: string): Promise<'processed' | 'confirmed' | 'finalized' | 'unknown'> {
        const status = await this.connection.getSignatureStatus(txHash);
        return status.value?.confirmationStatus || "unknown";
    }


    getWrappedToken() {
        return 'So11111111111111111111111111111111111111112'; // WSOL
    }


    getWrappedTokenUsdPair() {
        return '';
    }


    async getTokenBalance<T extends boolean>(address: string, baseTokenddress: string, formatDecimals?: T): Promise<T extends true ? number : BigInt> {
        const walletPublicKey = new PublicKey(address);
        const tokenMintPublicKey = new PublicKey(baseTokenddress);

        try {
            // TODO: utiliser getParsedTokenAccountsByOwner => voir https://github.com/Fn0skig/pump.fun/blob/main/market/token.ts

            // Rechercher le compte SPL Token associé à l'adresse et au mint
            const baseTokenccounts = await this.connection.getTokenAccountsByOwner(
                walletPublicKey,
                { mint: tokenMintPublicKey }
            );

            if (baseTokenccounts.value.length === 0) {
                return 0 as T extends true ? number : never; // Aucun compte trouvé pour ce token
            }

            // Extraire la balance du premier compte
            const accountData = baseTokenccounts.value[0].account.data;
            const balance = this.parseTokenBalance(accountData);

            if (!formatDecimals) {
                return BigInt(balance) as BigInt as T extends true ? never : BigInt;
            }

            // Récupérer les informations sur le mint pour obtenir les décimales
            const mintInfo = await getMint(this.connection, tokenMintPublicKey);
            const decimals = mintInfo.decimals;

            return balance / 10 ** decimals as T extends true ? number : never;

        } catch (err: any) {
            console.error("Error fetching token balance:", err);
            return 0 as T extends true ? number : never;
        }
    }


    private parseTokenBalance(data: Buffer): number {
        return Number(data.readBigUInt64LE(64)); // Position pour la balance
    }


    async getTokenPrice(tokenAddress: string, inverseAssets = false): Promise<number> {
        //   const url = `https://defi.shyft.to/v0/pools/get_by_pair?tokenA=${address}&tokenB=sol`;

        const jupiterApi = getJupiterClient();
        const outputMint = this.getWrappedToken();
        const amount = 1; // 1 SOL
        const quote = await getQuoteApi(jupiterApi, tokenAddress, outputMint, amount);
        return Number(quote?.swapUsdValue) || 0;
    }


    async getTokensPairPrice(pairAddress: string, inverseAssets = false): Promise<number> {
        const lpPublicKey = new PublicKey(pairAddress);
        const accountInfo = await this.connection.getAccountInfo(lpPublicKey);

        // WARNING: ne fonctionne pas correctement. dépend de chaque prototole. mieux vaut utiliser DexScreener

        if (!accountInfo?.data) throw new Error("Pool data not found");

        const accountData = accountInfo.data as Buffer;

        // Récupérer les mints avec les nouveaux offsets
        const baseTokenMint = new PublicKey(accountData.slice(432, 464)); // Offset pour base token
        const quoteTokenMint = new PublicKey(accountData.slice(400, 432)); // Offset pour quote token

        console.log("Base Token Mint Address:", baseTokenMint.toBase58());
        console.log("Quote Token Mint Address:", quoteTokenMint.toBase58());

        // Vérifiez que les mints sont corrects
        if (baseTokenMint.equals(quoteTokenMint)) {
            throw new Error("Base Token mint and Quote Token mint are identical. Pool data may be invalid.");
        }

        // Récupérer les décimales pour chaque token
        const [baseDecimals, quoteDecimals] = await Promise.all([
            this.getTokenDecimals(baseTokenMint),
            this.getTokenDecimals(quoteTokenMint),
        ]);

        console.log("Base Token Decimals:", baseDecimals);
        console.log("Quote Token Decimals:", quoteDecimals);

        // Récupérer les réserves des tokens
        const baseTokenAmount = accountData.readBigUInt64LE(12); // Offset supposé pour base token reserve
        const quoteTokenAmount = accountData.readBigUInt64LE(165); // Offset supposé pour quote token reserve

        console.log("Base Token Amount (raw):", baseTokenAmount.toString());
        console.log("Quote Token Amount (raw):", quoteTokenAmount.toString());

        // Convertir les réserves en unités lisibles
        const reserveBase = Number(baseTokenAmount) / Math.pow(10, baseDecimals);
        const reserveQuote = Number(quoteTokenAmount) / Math.pow(10, quoteDecimals);

        console.log("Reserve Base (adjusted):", reserveBase);
        console.log("Reserve Quote (adjusted):", reserveQuote);

        // Calculer le prix en fonction des réserves
        return inverseAssets ? reserveQuote / reserveBase : reserveBase / reserveQuote;
    }


    private async getTokenDecimals(mintAddress: PublicKey): Promise<number> {
        try {
            const mintInfo = await getMint(this.connection, mintAddress);
            return mintInfo.decimals;

        } catch (err: any) {
            console.error(`Error fetching decimals for mint ${mintAddress.toBase58()}:`, err);
            return 0; // Retour par défaut si une erreur survient
        }
    }


    // Effectue un swap entre deux tokens via l'API Jupiter
    async swapTokens(inputMint: string, outputMint: string, amount: number, slippageBps: number=100, swapMode: SwapMode="ExactIn"): Promise<string> {
        if (!this.signer) {
            throw new Error(`missing signer`);
        }

        const jupiterApi = getJupiterClient();

        // Quote
        const quote = await getQuoteApi(jupiterApi, inputMint, outputMint, amount, slippageBps, swapMode);
        if (! quote) throw new Error(`no quote available`);

        const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');

        // Swap
        const swap = await getSwapApi(jupiterApi, quote, this.signer, latestBlockhash);
        if (! swap) throw new Error(`no swap available`);

        // Build transaction
        const transaction = buildAndSignSwapTransaction(this.signer, swap);

        if (true) {
            // Set custom fees
            let priorityFeeEstimate = await getTransactionPriorityFeeEstimate(this.connection.rpcEndpoint, transaction);

            const ADJUSTMENT_FACTOR = 0.5;
            priorityFeeEstimate = priorityFeeEstimate * ADJUSTMENT_FACTOR;

            await addTransactionFees(this.connection, this.signer, transaction, priorityFeeEstimate);
        }

        // Send transaction
        const txId: string = await sendTransaction(this.connection, transaction);
        console.log("Transaction ID:", txId);

        // Wait for confirmation
        const status: SignatureResult = await confirmTransaction(this.connection, txId, latestBlockhash);

        if (status.err) {
            throw status.err;
        }

        console.log("Swap effectué avec succès !");
        console.log("Lien explorer:", `https://solscan.io/tx/${txId}`);

        return txId;
    }

}

