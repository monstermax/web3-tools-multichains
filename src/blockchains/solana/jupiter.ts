// jupiter.ts

import axios from "axios";
import { Keypair, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { createJupiterApiClient, DefaultApi, QuoteGetRequest, QuoteResponse, SwapMode as swapMode, SwapResponse, SwapPostRequest, SwapRequest } from '@jup-ag/api';

import { LatestBlockhash } from "./solana.types";




const jupiterEndpoint = "https://quote-api.jup.ag/v6";


export function getJupiterClient(): DefaultApi {
    const jupiterApi = createJupiterApiClient({ basePath: jupiterEndpoint });
    return jupiterApi;
}



/* ########## QUOTE ########## */

export function getQuoteRequest(inputMint: string, outputMint: string, amount: number, slippageBps: number=100, swapMode: swapMode="ExactIn"): QuoteGetRequest {
    const quoteRequest: QuoteGetRequest = {
        inputMint,
        outputMint,
        amount,
        slippageBps,
        swapMode,
        //platformFeeBps: "0",
        //dynamicSlippage: { "maxBps": 500 },
    };

    return quoteRequest;
}


export async function getQuoteCurl(inputMint: string, outputMint: string, amount: number, slippageBps: number=100, swapMode: swapMode="ExactIn"): Promise<QuoteResponse | null> {
    const quoteUrl = `${jupiterEndpoint}/quote`;

    const quoteRequest: QuoteGetRequest = getQuoteRequest(inputMint, outputMint, amount, slippageBps, swapMode);

    try {
        const response = await axios.get(quoteUrl, { params: quoteRequest });

        if (! response || ! response.data) {
            return null;
        }

        return response.data as QuoteResponse;

    } catch (err: any) {
        console.error('Error fetching quote:', err.response?.data || err.message);
        return null;
    }
}


export async function getQuoteCurlAlt(inputMint: string, outputMint: string, amount: number, slippageBps: number=100, swapMode: swapMode="ExactIn"): Promise<QuoteResponse | null> {
    const quoteUrl = `${jupiterEndpoint}/quote`;

    const url = `${quoteUrl}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&swapMode=${swapMode}`;
    //console.info(`Fetching quote from: ${url}`);

    try {
        const response = await axios.get(url);

        if (! response || ! response.data) {
            return null;
        }

        return response.data as QuoteResponse;

    } catch (err: any) {
        console.error('Error fetching quote:', err.response?.data || err.message);
        return null;
    }
}


export async function getQuoteApi(jupiterApi: DefaultApi, inputMint: string, outputMint: string, amount: number, slippageBps: number=100, swapMode: swapMode="ExactIn"): Promise<QuoteResponse | null> {
    const quoteRequest: QuoteGetRequest = getQuoteRequest(inputMint, outputMint, amount, slippageBps, swapMode);

    try {
        const quote: QuoteResponse | null = await jupiterApi.quoteGet(quoteRequest);
        return quote;

    } catch (err: any) {
        console.error('Error fetching quote:', err.message);
        return null;
    }
}



/* ########## SWAP ########## */

function getSwapRequest(quoteResponse: QuoteResponse, payer: Keypair, latestBlockhash?: LatestBlockhash): SwapRequest {
    const swapRequest: SwapRequest = {
        quoteResponse: quoteResponse,
        userPublicKey: payer.publicKey.toString(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        //overrideBlockhash: blockhash,
        //overrideLastValidBlockHeight: lastValidBlockHeight,

        //prioritizationFeeLamports: 'auto', // If auto is used, Jupiter will automatically set a priority fee and it will be capped at 5,000,000 lamports / 0.005 SOL
        //prioritizationFeeLamports: {
        //    priorityLevelWithMaxLamports: {
        //        maxLamports: 10_000_000,
        //        priorityLevel: "veryHigh", // If you want to land transaction fast, set this to use `veryHigh`. You will pay on average higher priority fee.
        //    },
        //    autoMultiplier: 2,
        //},

        //computeUnitPriceMicroLamports: 10_000_000, // ex. 10_000_000 microLamports/compute unit
        //computeUnitPriceMicroLamports: 0, // Désactiver les priority fees (pour eventuellement les ajouter plus tard pendant la construction de la transaction)
        computeUnitPriceMicroLamports: 'auto', // If auto is used, Jupiter will automatically set a priority fee and it will be capped at 5,000,000 lamports / 0.005 SOL
    };

    // Note: c'est soit computeUnitPriceMicroLamports soit prioritizationFeeLamports mais pas les 2

    if (latestBlockhash) {
        const { blockhash, lastValidBlockHeight } = latestBlockhash;
        //swapRequest.overrideBlockhash = latestBlockhash.blockhash;
        //swapRequest.overrideLastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
    }

    return swapRequest;
}


export async function getSwapCurl(quoteResponse: QuoteResponse, payer: Keypair, latestBlockhash?: LatestBlockhash): Promise<SwapResponse | null> {
    const swapRequest: SwapRequest = getSwapRequest(quoteResponse, payer, latestBlockhash);

    const headers = {
        'Content-Type': 'application/json',
    }

    const swapUrl = `${jupiterEndpoint}/swap`;

    const swapResponse = await axios.post(swapUrl, swapRequest, { headers });
    return swapResponse.data as SwapResponse;
}


export async function getSwapApi(jupiterApi: DefaultApi, quoteResponse: QuoteResponse, payer: Keypair, latestBlockhash?: LatestBlockhash): Promise<SwapResponse | null> {
    const swapRequest: SwapRequest = getSwapRequest(quoteResponse, payer, latestBlockhash);

    const swapPostRequest: SwapPostRequest = {
        swapRequest,
    }

    try {
        const swapResponse = await jupiterApi.swapPost(swapPostRequest);
        return swapResponse;

    } catch (err: any) {
        console.error('Error fetching quote:', err.message);
        return null;
    }
}


export function buildAndSignSwapTransaction(wallet: Keypair, swapResponse: SwapResponse, latestBlockhash?: LatestBlockhash): VersionedTransaction {
    const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, "base64");
    let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    if (latestBlockhash) {
        // Attach blockhash
        const transactionMessage = TransactionMessage.decompile(transaction.message);
        transactionMessage.recentBlockhash = latestBlockhash.blockhash;

        const message0 = transactionMessage.compileToV0Message();
        //message0.recentBlockhash = latestBlockhash.blockhash;

        transaction = new VersionedTransaction(message0);
    }

    // Sign transaction
    transaction.sign([wallet]);


    return transaction;
}


