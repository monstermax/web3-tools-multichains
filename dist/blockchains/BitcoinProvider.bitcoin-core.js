"use strict";
// BitcoinProvider.bitcoin-core.ts
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
exports.BitcoinCoreProvider = void 0;
const bitcoin_core_1 = __importDefault(require("bitcoin-core"));
class BitcoinCoreProvider {
    constructor(rpcUrl, rpcUser, rpcPassword) {
        this.connection = new bitcoin_core_1.default({
            host: rpcUrl,
            //port: 8332, // Port par défaut de Bitcoin RPC
            username: rpcUser,
            password: rpcPassword,
        });
    }
    getConnection() {
        return this.connection;
    }
    getWalletAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return ''; // TODO
        });
    }
    // Récupérer la balance d'une adresse en BTC
    getBalance(address, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const balance = yield this.connection.command("getreceivedbyaddress", address); // or getbalance
                if (!formatDecimals) {
                    return BigInt(balance * 1e8);
                }
                return balance; // Balance en BTC
            }
            catch (error) {
                console.error("Error fetching Bitcoin balance:", error);
                return 0;
            }
        });
    }
    // Vérifier le statut d'une transaction
    getTransactionStatus(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.connection.command("gettransaction", txHash);
                return transaction.confirmations > 0 ? "Confirmed" : "Pending";
            }
            catch (error) {
                console.error("Error fetching Bitcoin transaction status:", error);
                return "Unknown";
            }
        });
    }
    executeTransaction(to, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return '';
        });
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
    getTokenBalance(address, tokenAddress, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn("Tokens are not supported on Bitcoin natively.");
            return 0;
        });
    }
    getTokensPairPrice(pairAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn("Tokens are not supported on Bitcoin natively.");
            return 0;
        });
    }
    getTokenPrice(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn("Tokens are not supported on Bitcoin natively.");
            return 0;
        });
    }
    swapTokens(inputMint, outputMint, amount, slippage, swapMode) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn("Tokens are not supported on Bitcoin natively.");
            return '';
        });
    }
}
exports.BitcoinCoreProvider = BitcoinCoreProvider;
//# sourceMappingURL=BitcoinProvider.bitcoin-core.js.map