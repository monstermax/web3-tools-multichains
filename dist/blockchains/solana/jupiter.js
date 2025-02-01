"use strict";
// swap.jupiter.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJupiterClient = getJupiterClient;
exports.getQuoteRequest = getQuoteRequest;
exports.getQuoteCurl = getQuoteCurl;
exports.getQuoteCurlAlt = getQuoteCurlAlt;
exports.getQuoteApi = getQuoteApi;
exports.getSwapCurl = getSwapCurl;
exports.getSwapApi = getSwapApi;
exports.buildAndSignSwapTransaction = buildAndSignSwapTransaction;
const axios_1 = __importDefault(require("axios"));
const web3_js_1 = require("@solana/web3.js");
const api_1 = require("@jup-ag/api");
const jupiterEndpoint = "https://quote-api.jup.ag/v6";
function getJupiterClient() {
    const jupiterApi = (0, api_1.createJupiterApiClient)({ basePath: jupiterEndpoint });
    return jupiterApi;
}
/* ########## QUOTE ########## */
function getQuoteRequest(inputMint, outputMint, amount, slippageBps = 100, swapMode = "ExactIn") {
    const quoteRequest = {
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
function getQuoteCurl(inputMint_1, outputMint_1, amount_1) {
    return __awaiter(this, arguments, void 0, function* (inputMint, outputMint, amount, slippageBps = 100, swapMode = "ExactIn") {
        var _a;
        const quoteUrl = `${jupiterEndpoint}/quote`;
        const quoteRequest = getQuoteRequest(inputMint, outputMint, amount, slippageBps, swapMode);
        try {
            const response = yield axios_1.default.get(quoteUrl, { params: quoteRequest });
            if (!response || !response.data) {
                return null;
            }
            return response.data;
        }
        catch (err) {
            console.error('Error fetching quote:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            return null;
        }
    });
}
function getQuoteCurlAlt(inputMint_1, outputMint_1, amount_1) {
    return __awaiter(this, arguments, void 0, function* (inputMint, outputMint, amount, slippageBps = 100, swapMode = "ExactIn") {
        var _a;
        const quoteUrl = `${jupiterEndpoint}/quote`;
        const url = `${quoteUrl}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}&swapMode=${swapMode}`;
        //console.info(`Fetching quote from: ${url}`);
        try {
            const response = yield axios_1.default.get(url);
            if (!response || !response.data) {
                return null;
            }
            return response.data;
        }
        catch (err) {
            console.error('Error fetching quote:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            return null;
        }
    });
}
function getQuoteApi(jupiterApi_1, inputMint_1, outputMint_1, amount_1) {
    return __awaiter(this, arguments, void 0, function* (jupiterApi, inputMint, outputMint, amount, slippageBps = 100, swapMode = "ExactIn") {
        const quoteRequest = getQuoteRequest(inputMint, outputMint, amount, slippageBps, swapMode);
        try {
            const quote = yield jupiterApi.quoteGet(quoteRequest);
            return quote;
        }
        catch (err) {
            console.error('Error fetching quote:', err.message);
            return null;
        }
    });
}
/* ########## SWAP ########## */
function getSwapRequest(quoteResponse, payer, latestBlockhash) {
    const swapRequest = {
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
function getSwapCurl(quoteResponse, payer, latestBlockhash) {
    return __awaiter(this, void 0, void 0, function* () {
        const swapRequest = getSwapRequest(quoteResponse, payer, latestBlockhash);
        const headers = {
            'Content-Type': 'application/json',
        };
        const swapUrl = `${jupiterEndpoint}/swap`;
        const swapResponse = yield axios_1.default.post(swapUrl, swapRequest, { headers });
        return swapResponse.data;
    });
}
function getSwapApi(jupiterApi, quoteResponse, payer, latestBlockhash) {
    return __awaiter(this, void 0, void 0, function* () {
        const swapRequest = getSwapRequest(quoteResponse, payer, latestBlockhash);
        const swapPostRequest = {
            swapRequest,
        };
        try {
            const swapResponse = yield jupiterApi.swapPost(swapPostRequest);
            return swapResponse;
        }
        catch (err) {
            console.error('Error fetching quote:', err.message);
            return null;
        }
    });
}
function buildAndSignSwapTransaction(wallet, swapResponse, latestBlockhash) {
    const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, "base64");
    let transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
    if (latestBlockhash) {
        // Attach blockhash
        const transactionMessage = web3_js_1.TransactionMessage.decompile(transaction.message);
        transactionMessage.recentBlockhash = latestBlockhash.blockhash;
        const message0 = transactionMessage.compileToV0Message();
        //message0.recentBlockhash = latestBlockhash.blockhash;
        transaction = new web3_js_1.VersionedTransaction(message0);
    }
    // Sign transaction
    transaction.sign([wallet]);
    return transaction;
}
//# sourceMappingURL=jupiter.js.map