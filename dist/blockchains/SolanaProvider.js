"use strict";
// SolanaProvider.ts
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
exports.SolanaProvider = void 0;
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const solana_1 = require("./solana/solana");
const transaction_utils_1 = require("./solana/transaction.utils");
const jupiter_1 = require("./solana/jupiter");
class SolanaProvider {
    constructor(rpcUrl, privateKey) {
        rpcUrl = rpcUrl || 'https://api.mainnet-beta.solana.com';
        this.connection = new web3_js_1.Connection(rpcUrl, "confirmed");
        this.signer = privateKey ? web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(privateKey)) : null;
    }
    getConnection() {
        return this.connection;
    }
    getWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.signer;
        });
    }
    getWalletAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.signer) {
                throw new Error(`missing signer`);
            }
            return this.signer.publicKey.toBase58();
        });
    }
    getBalance(address, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const publicKey = new web3_js_1.PublicKey(address);
            const balance = yield this.connection.getBalance(publicKey);
            if (!formatDecimals) {
                return BigInt(balance);
            }
            return balance / 1e9; // Convert lamports to SOL
        });
    }
    executeTransaction(to_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (to, value, data = "0x") {
            if (!this.signer) {
                throw new Error(`missing signer`);
            }
            const transaction = new web3_js_1.Transaction;
            const txId = yield (0, transaction_utils_1.executeLegacyTransaction)(this.connection, this.signer, transaction);
            const result = yield (0, transaction_utils_1.checkTransactionStatus)(this.connection, txId);
            if (result.err) {
                throw new Error(result.err.toString());
            }
            return txId;
        });
    }
    getTransactionStatus(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const status = yield this.connection.getSignatureStatus(txHash);
            return ((_a = status.value) === null || _a === void 0 ? void 0 : _a.confirmationStatus) || "unknown";
        });
    }
    getWrappedToken() {
        return 'So11111111111111111111111111111111111111112'; // WSOL
    }
    getWrappedTokenUsdPair() {
        return '';
    }
    getTokenBalance(address, baseTokenddress, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletPublicKey = new web3_js_1.PublicKey(address);
            const tokenMintPublicKey = new web3_js_1.PublicKey(baseTokenddress);
            try {
                // TODO: utiliser getParsedTokenAccountsByOwner => voir https://github.com/Fn0skig/pump.fun/blob/main/market/token.ts
                // Rechercher le compte SPL Token associé à l'adresse et au mint
                const baseTokenccounts = yield this.connection.getTokenAccountsByOwner(walletPublicKey, { mint: tokenMintPublicKey });
                if (baseTokenccounts.value.length === 0) {
                    return 0; // Aucun compte trouvé pour ce token
                }
                // Extraire la balance du premier compte
                const accountData = baseTokenccounts.value[0].account.data;
                const balance = this.parseTokenBalance(accountData);
                if (!formatDecimals) {
                    return BigInt(balance);
                }
                // Récupérer les informations sur le mint pour obtenir les décimales
                const mintInfo = yield (0, spl_token_1.getMint)(this.connection, tokenMintPublicKey);
                const decimals = mintInfo.decimals;
                return balance / 10 ** decimals;
            }
            catch (err) {
                console.error("Error fetching token balance:", err);
                return 0;
            }
        });
    }
    parseTokenBalance(data) {
        return Number(data.readBigUInt64LE(64)); // Position pour la balance
    }
    getTokenPrice(tokenAddress_1) {
        return __awaiter(this, arguments, void 0, function* (tokenAddress, inverseAssets = false) {
            //   const url = `https://defi.shyft.to/v0/pools/get_by_pair?tokenA=${address}&tokenB=sol`;
            const jupiterApi = (0, jupiter_1.getJupiterClient)();
            const outputMint = this.getWrappedToken();
            const amount = 1; // 1 SOL
            const quote = yield (0, jupiter_1.getQuoteApi)(jupiterApi, tokenAddress, outputMint, amount);
            return Number(quote === null || quote === void 0 ? void 0 : quote.swapUsdValue) || 0;
        });
    }
    getTokensPairPrice(pairAddress_1) {
        return __awaiter(this, arguments, void 0, function* (pairAddress, inverseAssets = false) {
            const lpPublicKey = new web3_js_1.PublicKey(pairAddress);
            const accountInfo = yield this.connection.getAccountInfo(lpPublicKey);
            // WARNING: ne fonctionne pas correctement. dépend de chaque prototole. mieux vaut utiliser DexScreener
            if (!(accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.data))
                throw new Error("Pool data not found");
            const accountData = accountInfo.data;
            // Récupérer les mints avec les nouveaux offsets
            const baseTokenMint = new web3_js_1.PublicKey(accountData.slice(432, 464)); // Offset pour base token
            const quoteTokenMint = new web3_js_1.PublicKey(accountData.slice(400, 432)); // Offset pour quote token
            console.log("Base Token Mint Address:", baseTokenMint.toBase58());
            console.log("Quote Token Mint Address:", quoteTokenMint.toBase58());
            // Vérifiez que les mints sont corrects
            if (baseTokenMint.equals(quoteTokenMint)) {
                throw new Error("Base Token mint and Quote Token mint are identical. Pool data may be invalid.");
            }
            // Récupérer les décimales pour chaque token
            const [baseDecimals, quoteDecimals] = yield Promise.all([
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
        });
    }
    getTokenDecimals(mintAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mintInfo = yield (0, spl_token_1.getMint)(this.connection, mintAddress);
                return mintInfo.decimals;
            }
            catch (err) {
                console.error(`Error fetching decimals for mint ${mintAddress.toBase58()}:`, err);
                return 0; // Retour par défaut si une erreur survient
            }
        });
    }
    // Effectue un swap entre deux tokens via l'API Jupiter
    swapTokens(inputMint_1, outputMint_1, amount_1) {
        return __awaiter(this, arguments, void 0, function* (inputMint, outputMint, amount, slippageBps = 100, swapMode = "ExactIn") {
            if (!this.signer) {
                throw new Error(`missing signer`);
            }
            const jupiterApi = (0, jupiter_1.getJupiterClient)();
            // Quote
            const quote = yield (0, jupiter_1.getQuoteApi)(jupiterApi, inputMint, outputMint, Number(amount), slippageBps, swapMode);
            if (!quote)
                throw new Error(`no quote available`);
            const latestBlockhash = yield this.connection.getLatestBlockhash('confirmed');
            // Swap
            const swap = yield (0, jupiter_1.getSwapApi)(jupiterApi, quote, this.signer, latestBlockhash);
            if (!swap)
                throw new Error(`no swap available`);
            // Build transaction
            const transaction = (0, jupiter_1.buildAndSignSwapTransaction)(this.signer, swap);
            if (true) {
                // Set custom fees
                let priorityFeeEstimate = yield (0, solana_1.getTransactionPriorityFeeEstimate)(this.connection.rpcEndpoint, transaction);
                const ADJUSTMENT_FACTOR = 0.5;
                priorityFeeEstimate = priorityFeeEstimate * ADJUSTMENT_FACTOR;
                yield (0, transaction_utils_1.addTransactionFees)(this.connection, this.signer, transaction, priorityFeeEstimate);
            }
            // Send transaction
            const txId = yield (0, transaction_utils_1.sendTransaction)(this.connection, transaction);
            console.log("Transaction ID:", txId);
            // Wait for confirmation
            const status = yield (0, transaction_utils_1.confirmTransaction)(this.connection, txId, latestBlockhash);
            if (status.err) {
                throw status.err;
            }
            console.log("Swap effectué avec succès !");
            console.log("Lien explorer:", `https://solscan.io/tx/${txId}`);
            return txId;
        });
    }
}
exports.SolanaProvider = SolanaProvider;
//# sourceMappingURL=SolanaProvider.js.map