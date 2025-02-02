"use strict";
// BitcoinProvider.blockstream.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.BitcoinBlockstreamProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const bip39 = __importStar(require("bip39"));
class BitcoinBlockstreamProvider {
    constructor(mnemonic) {
        this.network = null;
        this.keyPair = null;
        this.rpcUrl = 'https://blockstream.info/api'; // URL de l'API Bitcoin RPC ou service tiers
        if (mnemonic) {
            const isTestnet = false;
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            this.network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
            //const root = bitcoin.bip32.fromSeed(seed, isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);
            //this.keyPair = bitcoin.ECPair.fromWIF(root.toWIF());
        }
    }
    getConnection() {
        return null;
    }
    getWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            return null; // TODO
        });
    }
    getWalletAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return ''; // TODO
        });
    }
    // Récupérer la balance d'une adresse Bitcoin
    getBalance(address, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.rpcUrl}/address/${address}`);
                //console.log("data:", response.data); // Afficher les données pour déboguer si nécessaire
                // Calculer la balance nette
                const funded = response.data.chain_stats.funded_txo_sum || 0; // En satoshis
                const spent = response.data.chain_stats.spent_txo_sum || 0; // En satoshis
                const balanceInSatoshis = funded - spent;
                if (!formatDecimals) {
                    return BigInt(balanceInSatoshis);
                }
                return balanceInSatoshis / 1e8; // Convertir en BTC
            }
            catch (error) {
                console.error("Error fetching Bitcoin balance:", error);
                throw new Error("Failed to fetch balance");
            }
        });
    }
    executeTransaction(to, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.keyPair || !this.network) {
                throw new Error(`missing signer`);
            }
            try {
                // Conversion en satoshis
                const satoshis = Math.floor(Number(value) * 1e8);
                // Récupérer les UTXOs de l'adresse associée
                const address = bitcoin.payments.p2pkh({ pubkey: this.keyPair.publicKey, network: this.network }).address;
                const { data: utxos } = yield axios_1.default.get(`https://blockstream.info/api/address/${address}/utxo`);
                if (!utxos || utxos.length === 0) {
                    throw new Error("No UTXOs available for this address.");
                }
                // Construire la transaction
                const psbt = new bitcoin.Psbt({ network: this.network });
                let inputSum = 0;
                for (const utxo of utxos) {
                    psbt.addInput({
                        hash: utxo.txid,
                        index: utxo.vout,
                        nonWitnessUtxo: Buffer.from(utxo.raw, "hex"),
                    });
                    inputSum += utxo.value;
                    if (inputSum >= satoshis)
                        break;
                }
                // Ajouter la sortie (le destinataire)
                psbt.addOutput({
                    address: to,
                    value: satoshis,
                });
                // Ajouter une sortie pour la "change address" si nécessaire
                const fee = 1000; // Par exemple, 1000 satoshis
                const change = inputSum - satoshis - fee;
                if (change > 0) {
                    psbt.addOutput({
                        address: address,
                        value: change,
                    });
                }
                // Signer la transaction
                psbt.signAllInputs(this.keyPair);
                psbt.finalizeAllInputs();
                // Récupérer la transaction en hex
                const transactionHex = psbt.extractTransaction().toHex();
                // Diffuser la transaction
                const { data: txId } = yield axios_1.default.post("https://blockstream.info/api/tx", transactionHex);
                console.log(`Transaction sent: ${txId}`);
                return txId;
            }
            catch (error) {
                console.error("Error executing transaction on Bitcoin:", error);
                throw error;
            }
        });
    }
    // Récupérer le statut d'une transaction
    getTransactionStatus(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.rpcUrl}/tx/${txHash}`);
                const confirmations = response.data.confirmations;
                if (confirmations > 0)
                    return "Success";
                return "Pending";
            }
            catch (error) {
                console.error("Error fetching transaction status:", error);
                throw new Error("Failed to fetch transaction status");
            }
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
    // Non applicable pour Bitcoin natif (remplissage minimal pour respecter l'interface)
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
            return '';
        });
    }
}
exports.BitcoinBlockstreamProvider = BitcoinBlockstreamProvider;
//# sourceMappingURL=BitcoinProvider.blockstream.js.map