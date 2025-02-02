"use strict";
// TronProvider.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TronProvider = void 0;
const tronweb_1 = require("tronweb");
const LP_ABI = [
    {
        constant: true,
        inputs: [],
        name: "getReserves",
        outputs: [
            { name: "_reserve0", type: "uint112" },
            { name: "_reserve1", type: "uint112" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "token0",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "token1",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
];
class TronProvider {
    constructor(rpcUrl, privateKey) {
        this.signer = null;
        const fullNodeUrl = rpcUrl || "https://api.trongrid.io";
        const eventServerUrl = rpcUrl || "https://api.trongrid.io";
        const solidityNodeUrl = rpcUrl || "https://api.trongrid.io";
        this.connection = new tronweb_1.TronWeb({
            fullHost: fullNodeUrl,
            eventServer: eventServerUrl,
            solidityNode: solidityNodeUrl,
            privateKey: privateKey || undefined,
        });
        if (privateKey) {
            this.signer = this.connection.address.fromPrivateKey(privateKey) || null;
            console.log("Signer initialisé :", this.signer);
        }
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
            try {
                if (!this.signer) {
                    throw new Error("Aucune clé privée fournie, impossible de récupérer l'adresse.");
                }
                return this.signer;
            }
            catch (error) {
                console.error("Erreur lors de la récupération de l'adresse du wallet:", error);
                return "";
            }
        });
    }
    // Obtenir le solde TRX d'une adresse
    getBalance(address, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const balance = yield this.connection.trx.getBalance(address);
                if (!formatDecimals) {
                    return BigInt(balance);
                }
                return balance / 1e6; // Convertir en TRX (6 décimales)
            }
            catch (error) {
                console.error("Error fetching TRX balance:", error);
                return 0;
            }
        });
    }
    executeTransaction(to, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.signer) {
                    throw new Error("Signer non initialisé. Impossible d'envoyer une transaction.");
                }
                // Convertir la valeur en Sun (1 TRX = 1e6 Sun)
                const amountInSun = this.connection.toSun(Number(value));
                // Construire la transaction
                const transaction = yield this.connection.transactionBuilder.sendTrx(to, // Adresse du destinataire
                Number(amountInSun), // Montant en Sun
                this.signer // Adresse de l'expéditeur (dérivée de la clé privée)
                );
                // Signer la transaction
                const signedTransaction = yield this.connection.trx.sign(transaction);
                // Envoyer la transaction sur le réseau Tron
                const broadcast = yield this.connection.trx.sendRawTransaction(signedTransaction);
                if (broadcast.result) {
                    console.log("Transaction envoyée. TX Hash:", broadcast.txid);
                    return broadcast.txid; // Retourne l'ID de la transaction
                }
                else {
                    throw new Error("La transaction n'a pas été acceptée par le réseau.");
                }
            }
            catch (error) {
                console.error("Erreur lors de l'exécution de la transaction sur Tron:", error);
                return "";
            }
        });
    }
    // Vérifier le statut d'une transaction
    getTransactionStatus(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tx = yield this.connection.trx.getTransaction(txHash);
                return tx.ret && tx.ret[0].contractRet === "SUCCESS" ? "Confirmed" : "Pending";
            }
            catch (error) {
                console.error("Error fetching transaction status:", error);
                return "Unknown";
            }
        });
    }
    getWrappedToken() {
        return 'TT2Yb5hZgA1S3dEmKaSAgLxUz4JxcqmeAe'; // WTRX
    }
    getWrappedTokenUsdPair() {
        return 'TFGDbUyP8xez44C76fin3bn3Ss6jugoUwJ'; // TRON/USDT
    }
    // Obtenir la balance TRC-20 d'une adresse pour un token donné
    getTokenBalance(address, tokenAddress, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contract = yield this.connection.contract().at(tokenAddress);
                const decimals = yield contract.decimals().call();
                const rawBalance = yield contract.balanceOf(address).call();
                if (!formatDecimals) {
                    return BigInt(rawBalance);
                }
                return parseFloat(rawBalance) / Math.pow(10, decimals);
            }
            catch (error) {
                console.error("Error fetching TRC-20 token balance:", error);
                return 0;
            }
        });
    }
    // Obtenir le prix d'un token (TRX ou TRC-20)
    getTokenPrice(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not available');
        });
    }
    getTokensPairPrice(pairAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Charger le contrat LP
                const lpContract = yield this.connection.contract(LP_ABI, pairAddress);
                // Récupérer les adresses des tokens du pool
                const [token0Address, token1Address] = yield Promise.all([
                    lpContract.token0().call(),
                    lpContract.token1().call(),
                ]);
                // Récupérer les décimales des tokens
                const erc20Abi = [
                    {
                        inputs: [],
                        name: "decimals",
                        outputs: [{ name: "", type: "uint8" }],
                        stateMutability: "view",
                        type: "function",
                    },
                ];
                const token0Contract = yield this.connection.contract(erc20Abi, token0Address);
                const token1Contract = yield this.connection.contract(erc20Abi, token1Address);
                const [decimals0, decimals1] = yield Promise.all([
                    token0Contract.decimals().call(),
                    token1Contract.decimals().call(),
                ]);
                // Récupérer les réserves
                const [reserve0, reserve1] = yield lpContract.getReserves().call();
                // Ajuster les réserves avec les décimales
                const adjustedReserve0 = parseInt(reserve0._reserve0, 10) / Math.pow(10, decimals0);
                const adjustedReserve1 = parseInt(reserve1._reserve1, 10) / Math.pow(10, decimals1);
                // Calculer le prix
                return adjustedReserve1 / adjustedReserve0; // Prix de token1 en termes de token0
            }
            catch (error) {
                console.error("Error fetching token price on Tron:", error);
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
exports.TronProvider = TronProvider;
//# sourceMappingURL=TronProvider.js.map