"use strict";
// pumpfun.ts
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
exports.getMarketCapFromBondingCurve = exports.getBondingCurveReserves = void 0;
exports.getPumpPortalWebsocket = getPumpPortalWebsocket;
exports.subscribeNewToken = subscribeNewToken;
exports.unsubscribeNewToken = unsubscribeNewToken;
exports.subscribeAccountTrade = subscribeAccountTrade;
exports.unsubscribeAccountTrade = unsubscribeAccountTrade;
exports.subscribeTokenTrade = subscribeTokenTrade;
exports.unsubscribeTokenTrade = unsubscribeTokenTrade;
exports.subscribeRaydiumLiquidity = subscribeRaydiumLiquidity;
exports.unsubscribeRaydiumLiquidity = unsubscribeRaydiumLiquidity;
exports.createWallet = createWallet;
exports.createToken = createToken;
exports.sendPumpTransaction = sendPumpTransaction;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const ws_1 = __importDefault(require("ws"));
const bs58_1 = __importDefault(require("bs58"));
const web3_js_1 = require("@solana/web3.js");
const transaction_utils_1 = require("./transaction.utils");
//const tokensTxCount: { [address: string]: number } = {};
//const tradersTxCount: { [address: string]: number } = {};
//const devsTokenCount: { [address: string]: number } = {};
function getPumpPortalWebsocket() {
    const ws = new ws_1.default('wss://pumpportal.fun/api/data');
    return ws;
}
function subscribeNewToken(ws) {
    // Subscribing to token creation events
    let payload = {
        method: "subscribeNewToken",
    };
    ws.send(JSON.stringify(payload)); // result => SubscribeResult + CreateTokenResult
}
function unsubscribeNewToken(ws) {
    let payload = {
        method: "unsubscribeNewToken",
    };
    ws.send(JSON.stringify(payload)); // result => UnsubscribeResult
}
function subscribeAccountTrade(ws, keys) {
    let payload = {
        method: "subscribeAccountTrade",
        keys,
        //keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
    };
    ws.send(JSON.stringify(payload)); // result => SubscribeResult + TokenTradeResult
}
function unsubscribeAccountTrade(ws, keys) {
    let payload = {
        method: "unsubscribeAccountTrade",
        keys,
        //keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
    };
    ws.send(JSON.stringify(payload)); // result => UnsubscribeResult
}
function subscribeTokenTrade(ws, keys) {
    let payload = {
        method: "subscribeTokenTrade",
        keys,
        //keys: ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"] // array of token CAs to watch
    };
    ws.send(JSON.stringify(payload)); // result => SubscribeResult + TokenTradeResult
}
function unsubscribeTokenTrade(ws, keys) {
    let payload = {
        method: "unsubscribeTokenTrade",
        keys,
        //keys: ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"] // array of token CAs to watch
    };
    ws.send(JSON.stringify(payload)); // result => UnsubscribeResult
}
function subscribeRaydiumLiquidity(ws) {
    let payload = {
        method: "subscribeRaydiumLiquidity",
    };
    ws.send(JSON.stringify(payload)); // result => SubscribeResult + RaydiumLiquidityResult
}
function unsubscribeRaydiumLiquidity(ws) {
    throw new Error(`method unsubscribeRaydiumLiquidity not supported`);
    let payload = {
        method: "unsubscribeRaydiumLiquidity",
    };
    ws.send(JSON.stringify(payload)); // result => UnsubscribeResult
}
function createWallet() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get("https://pumpportal.fun/api/create-wallet");
        // JSON Object with keys for a newly generated wallet and the linked API key
        const data = response.data;
        return data;
    });
}
function createToken(connection, privateKey, walletAddress, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const signerKeyPair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(privateKey));
        // Generate a random keypair for token
        const mintKeypair = web3_js_1.Keypair.generate();
        // Define token metadata
        const formData = new FormData();
        if (options.imageFile) {
            if (!fs_1.default.existsSync(options.imageFile)) {
                throw new Error(`image file "${options.imageFile}" not found`);
            }
            formData.append("file", yield fs_1.default.openAsBlob(options.imageFile)); // Image file "./example.png"
        }
        formData.append("name", options.name);
        formData.append("symbol", options.symbol);
        formData.append("description", options.description);
        if (options.twitter) {
            formData.append("twitter", options.twitter);
        }
        if (options.telegram) {
            formData.append("telegram", options.telegram);
        }
        if (options.website) {
            formData.append("website", options.website);
        }
        formData.append("showName", "true");
        // Create IPFS metadata storage
        const metadataResponse = yield axios_1.default.post("https://pump.fun/api/ipfs", formData);
        const metadataResponseJSON = yield metadataResponse.data;
        // Get the create transaction
        const response = yield axios_1.default.post(`https://pumpportal.fun/api/trade-local`, JSON.stringify({
            "publicKey": walletAddress,
            "action": "create",
            "tokenMetadata": {
                name: metadataResponseJSON.metadata.name,
                symbol: metadataResponseJSON.metadata.symbol,
                uri: metadataResponseJSON.metadataUri
            },
            "mint": mintKeypair.publicKey.toBase58(),
            "denominatedInSol": "true",
            "amount": options.solAmount, // dev buy of 1 SOL
            "slippage": 10,
            "priorityFee": 0.0005,
            "pool": "pump"
        }), {
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (response.status === 200) { // successfully generated transaction
            const data = yield response.data;
            const tx = web3_js_1.VersionedTransaction.deserialize(new Uint8Array(data));
            tx.sign([mintKeypair, signerKeyPair]);
            const signature = yield (0, transaction_utils_1.sendAndConfirmTransaction)(connection, tx);
            console.log("Transaction: https://solscan.io/tx/" + signature);
        }
        else {
            console.log(response.statusText); // log error
        }
    });
}
function sendPumpTransaction(connection, wallet, walletAddress, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const req = {
            "action": options.orderType, // "buy" or "sell"
            "mint": options.tokenAddress, // contract address of the token you want to trade
            "publicKey": walletAddress, // Your wallet public key
            "denominatedInSol": "true", // "true" if amount is amount of SOL, "false" if amount is number of tokens
            "amount": options.amount.toString(), // amount of SOL or tokens
            "slippage": (_a = options.slippage) !== null && _a !== void 0 ? _a : 10, // percent slippage allowed
            "priorityFee": (_b = options.priorityFee) !== null && _b !== void 0 ? _b : 0.00001, // priority fee
            "pool": "pump" // exchange to trade on. "pump" or "raydium"
        };
        const response = yield fetch(`https://pumpportal.fun/api/trade-local`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req)
        });
        if (response.status === 200) { // successfully generated transaction
            const data = yield response.arrayBuffer();
            const tx = web3_js_1.VersionedTransaction.deserialize(new Uint8Array(data));
            tx.sign([wallet]);
            const signature = yield (0, transaction_utils_1.sendAndConfirmTransaction)(connection, tx);
            console.log("Transaction: https://solscan.io/tx/" + signature);
            return signature;
        }
        else {
            console.log(response.statusText); // log error
            throw new Error(`transaction error. ${response.statusText}`);
        }
    });
}
// 🟢 Fonction pour récupérer les réserves du contrat de la Bonding Curve
const getBondingCurveReserves = (connection, bondingCurveAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bondingCurvePublicKey = new web3_js_1.PublicKey(bondingCurveAddress);
        // 🔹 Récupérer l'état du compte du smart contract
        const accountInfo = yield connection.getParsedAccountInfo(bondingCurvePublicKey);
        if (!accountInfo || !accountInfo.value || !accountInfo.value.data) {
            console.warn(`⚠️ Impossible de récupérer les réserves pour ${bondingCurveAddress}`);
            return null;
        }
        // 🔹 Décoder les données du smart contract (la structure dépend du programme Pump.fun)
        const parsedData = accountInfo.value.data;
        if (!parsedData.parsed || !parsedData.parsed.info) {
            console.warn(`⚠️ Données du compte non parsables pour ${bondingCurveAddress}`);
            return null;
        }
        // 🔹 Extraction des valeurs (Hypothèse : on connaît la structure des données)
        //const solReserve = Number(data.readBigUInt64LE(0) / BigInt(1e9));  // SOL en lamports
        //const tokenReserve = Number(data.readBigUInt64LE(8));       // Nombre de tokens dans la Bonding Curve
        const solReserve = parsedData.parsed.info.solReserve / 1e9; // Convertir lamports -> SOL
        const tokenReserve = parsedData.parsed.info.tokenReserve; // Nombre de tokens en réserve
        return { solReserve, tokenReserve };
    }
    catch (error) {
        console.error(`❌ Erreur lors de la récupération des réserves de la Bonding Curve pour ${bondingCurveAddress}:`, error);
        return null;
    }
});
exports.getBondingCurveReserves = getBondingCurveReserves;
const getMarketCapFromBondingCurve = (connection, bondingCurveAddress, totalSupply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reserves = yield (0, exports.getBondingCurveReserves)(connection, bondingCurveAddress);
        if (!reserves)
            return null;
        const { solReserve, tokenReserve } = reserves;
        // 🔹 Calcul du prix du token en SOL
        const priceInSol = solReserve / tokenReserve;
        if (!priceInSol || isNaN(priceInSol)) {
            console.warn(`⚠️ Prix en SOL invalide pour ${bondingCurveAddress}`);
            return null;
        }
        // 🔹 Calcul du Market Cap
        const marketCap = totalSupply * priceInSol;
        return marketCap;
    }
    catch (error) {
        console.error(`❌ Erreur lors du calcul du Market Cap depuis la Bonding Curve:`, error);
        return null;
    }
});
exports.getMarketCapFromBondingCurve = getMarketCapFromBondingCurve;
//# sourceMappingURL=pumpfun.js.map