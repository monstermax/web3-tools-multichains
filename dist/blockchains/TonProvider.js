"use strict";
// TonProvider.ts
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
exports.TonProvider = void 0;
const tonweb_1 = __importDefault(require("tonweb"));
class TonProvider {
    constructor(rpcUrl, privateKey) {
        this.privateKey = null;
        this.signer = null;
        rpcUrl = rpcUrl || "https://toncenter.com/api/v2/jsonRPC";
        this.connection = new tonweb_1.default(new tonweb_1.default.HttpProvider(rpcUrl));
        if (privateKey) {
            this.privateKey = privateKey;
            this.initializeSigner(privateKey);
        }
    }
    initializeSigner(privateKey) {
        try {
            // Convertir la clé privée en Uint8Array
            const keyBuffer = Buffer.from(privateKey, "hex");
            //const keyPair = privateKey.includes(' ') ? await mnemonicToKeyPair(mnemonic.split(' ')) : TonWeb.utils.nacl.sign.keyPair.fromSeed(keyBuffer);
            const keyPair = tonweb_1.default.utils.nacl.sign.keyPair.fromSeed(keyBuffer);
            // Définir le type de wallet (ici Wallet V3)
            const WalletClass = this.connection.wallet.all['v3R2'];
            // Créer le wallet TON à partir de la clé publique
            this.signer = new WalletClass(this.connection.provider, {
                publicKey: keyPair.publicKey
            });
            console.log("Signer (wallet) initialisé avec succès !");
        }
        catch (error) {
            console.error("Erreur lors de l'initialisation du signer:", error);
            this.signer = null;
        }
    }
    getConnection() {
        return this.connection;
    }
    getWalletAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.signer) {
                    throw new Error("Signer non initialisé");
                }
                const address = yield this.signer.getAddress();
                return address.toString();
            }
            catch (error) {
                console.error("Erreur lors de la récupération de l'adresse du wallet:", error);
                return "";
            }
        });
    }
    // Obtenir le solde d'une adresse TON
    getBalance(address, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const wallet = this.connection.wallet.create({ address });
                const balance = yield this.connection.getBalance((_a = wallet.address) !== null && _a !== void 0 ? _a : '');
                if (!formatDecimals) {
                    return BigInt(balance);
                }
                return Number(balance) / 1e9; // Convertir en TON
            }
            catch (error) {
                console.error("Error fetching TON balance:", error);
                return 0;
            }
        });
    }
    executeTransaction(to, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.privateKey || !this.signer) {
                    throw new Error("Signer non initialisé. Impossible d'envoyer une transaction.");
                }
                // Convertir la valeur en nanotons (TON a 9 décimales)
                const amountInNanotons = tonweb_1.default.utils.toNano(value);
                const secretKey = Buffer.from(this.privateKey, "hex");
                // Créer la transaction
                const tx = yield this.signer.methods.transfer({
                    secretKey, // Clé privée du wallet
                    toAddress: to, // Adresse du destinataire
                    amount: amountInNanotons, // Montant en nanotons
                    seqno: (yield this.signer.methods.seqno().call()) || 0, // Récupérer le numéro de séquence
                    payload: "", // Message optionnel
                }).send();
                console.log("Transaction envoyée. TX Hash:", tx);
                return tx; // Retourne l'identifiant de la transaction (TX Hash)
            }
            catch (error) {
                console.error("Erreur lors de l'exécution de la transaction sur TON:", error);
                return "";
            }
        });
    }
    // Statut d'une transaction
    getTransactionStatus(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const txInfo = yield this.connection.provider.call2(txHash, // Adresse de la transaction
                'getStatus', []);
                return txInfo.stack[0][1] === '1' ? "Confirmed" : "Pending";
            }
            catch (error) {
                console.error("Error fetching transaction status:", error);
                return "Unknown";
            }
        });
    }
    getWrappedToken() {
        return 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO'; // WTON
    }
    getWrappedTokenUsdPair() {
        return '';
    }
    // Méthode pour récupérer le solde d'un token TIP-3
    getTokenBalance(address, tokenAddress, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.connection.provider.call2(tokenAddress, // Adresse du contrat
                'getBalance', // Nom de la méthode
                [['address', address]] // Paramètres sous forme de tuple
                );
                const balance = parseInt(result.stack[0][1], 10);
                if (!formatDecimals) {
                    return BigInt(balance);
                }
                return balance / 1e9;
            }
            catch (error) {
                console.error("Error fetching token balance on TON:", error);
                return 0;
            }
        });
    }
    // Prix du token (par exemple : TON/USD)
    getTokenPrice(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not available');
        });
    }
    getTokensPairPrice(pairAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Récupérer les adresses des tokens du pool
                const tokenData = yield this.connection.provider.call2(pairAddress, 'getTokens', []);
                const token0Address = tokenData.stack[0][1];
                const token1Address = tokenData.stack[1][1];
                // Récupérer les réserves
                const reservesData = yield this.connection.provider.call2(pairAddress, 'getReserves', []);
                const reserve0 = parseInt(reservesData.stack[0][1], 10);
                const reserve1 = parseInt(reservesData.stack[1][1], 10);
                // Conversion en décimales (supposons 9 décimales par défaut)
                const adjustedReserve0 = reserve0 / 1e9;
                const adjustedReserve1 = reserve1 / 1e9;
                return adjustedReserve1 / adjustedReserve0;
            }
            catch (error) {
                console.error("Error fetching LP token price:", error);
                return 0;
            }
        });
    }
    swapTokens(inputMint, outputMint, amount, slippage, swapMode) {
        return __awaiter(this, void 0, void 0, function* () {
            return ''; // TODO
        });
    }
}
exports.TonProvider = TonProvider;
//# sourceMappingURL=TonProvider.js.map