// pumpfun.ts

import fs from "fs";
import axios from "axios";
import WebSocket from "ws";
import bs58 from "bs58";
import { Connection, Keypair, ParsedAccountData, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { sendAndConfirmTransaction } from "./transaction.utils";


export type Payload = {
    method: string,
    keys?: string[],
}

export type SubscribeResult = { message: string };
export type UnsubscribeResult = { message: string };

export type CreateTokenResult = {
    signature: string
    mint: string
    traderPublicKey: string
    txType: 'create'
    initialBuy: number
    solAmount: number
    bondingCurveKey: string
    vTokensInBondingCurve: number
    vSolInBondingCurve: number
    marketCapSol: number
    name: string
    symbol: string
    uri: string
    pool: string
}

export type TokenTradeResult = {
    signature: string
    mint: string
    traderPublicKey: string
    txType: 'sell' | 'buy'
    tokenAmount: number
    solAmount: number
    newTokenBalance: number
    bondingCurveKey: string
    vTokensInBondingCurve: number
    vSolInBondingCurve: number
    marketCapSol: number
    pool: string
}

export type CreateWalletResult = {
    apiKey: string
    walletPublicKey: string
    privateKey: string
};

export type RaydiumLiquidityResult = {
    signature: string
    mint: string
    txType: 'addLiquidity'
    marketId: string
    marketCapSol: number
    price: number
    pool: string
}

export type CreateTokenOptions = {
    name: string,
    imageFile?: string,
    symbol: string,
    description: string,
    twitter?: string,
    telegram?: string,
    website?: string,
    solAmount: number,
}

export type SendPortalTransactionOptions = {
    tokenAddress: string,
    orderType: 'buy' | 'sell',
    amount: string | BigInt | number,
    priorityFee?: number,
    slippage?: number,
}




//const tokensTxCount: { [address: string]: number } = {};
//const tradersTxCount: { [address: string]: number } = {};
//const devsTokenCount: { [address: string]: number } = {};



export function getPumpPortalWebsocket(): WebSocket {
    const ws = new WebSocket('wss://pumpportal.fun/api/data');
    return ws;
}


export function subscribeNewToken(ws: WebSocket) {
    // Subscribing to token creation events
    let payload: Payload = {
        method: "subscribeNewToken",
    }

    ws.send(JSON.stringify(payload)); // result => SubscribeResult + CreateTokenResult
}

export function unsubscribeNewToken(ws: WebSocket) {
    let payload: Payload = {
        method: "unsubscribeNewToken",
    }

    ws.send(JSON.stringify(payload)); // result => UnsubscribeResult
}


export function subscribeAccountTrade(ws: WebSocket, keys: string[]) {
    let payload: Payload = {
        method: "subscribeAccountTrade",
        keys,
        //keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
    };

    ws.send(JSON.stringify(payload)); // result => SubscribeResult + TokenTradeResult
}

export function unsubscribeAccountTrade(ws: WebSocket, keys: string[]) {
    let payload: Payload = {
        method: "unsubscribeAccountTrade",
        keys,
        //keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
    };

    ws.send(JSON.stringify(payload)); // result => UnsubscribeResult
}


export function subscribeTokenTrade(ws: WebSocket, keys: string[]) {
    let payload: Payload = {
        method: "subscribeTokenTrade",
        keys,
        //keys: ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"] // array of token CAs to watch
    };

    ws.send(JSON.stringify(payload)); // result => SubscribeResult + TokenTradeResult
}

export function unsubscribeTokenTrade(ws: WebSocket, keys: string[]) {
    let payload: Payload = {
        method: "unsubscribeTokenTrade",
        keys,
        //keys: ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"] // array of token CAs to watch
    };

    ws.send(JSON.stringify(payload)); // result => UnsubscribeResult
}


export function subscribeRaydiumLiquidity(ws: WebSocket) {
    let payload: Payload = {
        method: "subscribeRaydiumLiquidity",
    };

    ws.send(JSON.stringify(payload)); // result => SubscribeResult + RaydiumLiquidityResult
}

export function unsubscribeRaydiumLiquidity(ws: WebSocket) {
    throw new Error(`method unsubscribeRaydiumLiquidity not supported`);

    let payload: Payload = {
        method: "unsubscribeRaydiumLiquidity",
    };

    ws.send(JSON.stringify(payload)); // result => UnsubscribeResult
}


export async function createWallet(): Promise<CreateWalletResult> {
    const response = await axios.get("https://pumpportal.fun/api/create-wallet");

    // JSON Object with keys for a newly generated wallet and the linked API key
    const data = response.data as CreateWalletResult;

    return data;
}



export async function createToken(connection: Connection, privateKey: string, walletAddress: string, options: CreateTokenOptions) {
    const signerKeyPair = Keypair.fromSecretKey(bs58.decode(privateKey));

    // Generate a random keypair for token
    const mintKeypair = Keypair.generate();


    // Define token metadata
    const formData = new FormData();

    if (options.imageFile) {
        if (!fs.existsSync(options.imageFile)) {
            throw new Error(`image file "${options.imageFile}" not found`);
        }

        formData.append("file", await fs.openAsBlob(options.imageFile)); // Image file "./example.png"
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
    const metadataResponse = await axios.post("https://pump.fun/api/ipfs", formData);
    const metadataResponseJSON = await metadataResponse.data;

    // Get the create transaction
    const response = await axios.post(`https://pumpportal.fun/api/trade-local`,
        JSON.stringify({
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
        })
        , {
            headers: {
                "Content-Type": "application/json",
            }
        });

    if (response.status === 200) { // successfully generated transaction
        const data = await response.data;

        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        tx.sign([mintKeypair, signerKeyPair]);

        const signature = await sendAndConfirmTransaction(connection, tx);
        console.log("Transaction: https://solscan.io/tx/" + signature);

    } else {
        console.log(response.statusText); // log error
    }
}


export async function sendPumpTransaction(connection: Connection, wallet: Keypair, walletAddress: string, options: SendPortalTransactionOptions): Promise<string> {
    const req = {
        "action": options.orderType,                 // "buy" or "sell"
        "mint": options.tokenAddress,         // contract address of the token you want to trade
        "publicKey": walletAddress,  // Your wallet public key
        "denominatedInSol": "true",     // "true" if amount is amount of SOL, "false" if amount is number of tokens
        "amount": options.amount.toString(),                  // amount of SOL or tokens
        "slippage": options.slippage ?? 10,                   // percent slippage allowed
        "priorityFee": options.priorityFee ?? 0.00001,          // priority fee
        "pool": "pump"                   // exchange to trade on. "pump" or "raydium"
    };

    const response = await fetch(`https://pumpportal.fun/api/trade-local`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req)
        });

    if (response.status === 200) { // successfully generated transaction
        const data = await response.arrayBuffer();

        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        tx.sign([wallet]);

        const signature = await sendAndConfirmTransaction(connection, tx);
        console.log("Transaction: https://solscan.io/tx/" + signature);

        return signature;

    } else {
        console.log(response.statusText); // log error
        throw new Error(`transaction error. ${response.statusText}`)
    }
}



// 🟢 Fonction pour récupérer les réserves du contrat de la Bonding Curve
export const getBondingCurveReserves = async (connection: Connection, bondingCurveAddress: string): Promise<{ solReserve: number, tokenReserve: number } | null> => {
    try {
        const bondingCurvePublicKey = new PublicKey(bondingCurveAddress);

        // 🔹 Récupérer l'état du compte du smart contract
        const accountInfo = await connection.getParsedAccountInfo(bondingCurvePublicKey);

        if (!accountInfo || !accountInfo.value || !accountInfo.value.data) {
            console.warn(`⚠️ Impossible de récupérer les réserves pour ${bondingCurveAddress}`);
            return null;
        }

        // 🔹 Décoder les données du smart contract (la structure dépend du programme Pump.fun)
        const parsedData = accountInfo.value.data as ParsedAccountData;

        if (!parsedData.parsed || !parsedData.parsed.info) {
            console.warn(`⚠️ Données du compte non parsables pour ${bondingCurveAddress}`);
            return null;
        }

        // 🔹 Extraction des valeurs (Hypothèse : on connaît la structure des données)
        //const solReserve = Number(data.readBigUInt64LE(0) / BigInt(1e9));  // SOL en lamports
        //const tokenReserve = Number(data.readBigUInt64LE(8));       // Nombre de tokens dans la Bonding Curve

        const solReserve = parsedData.parsed.info.solReserve / 1e9;  // Convertir lamports -> SOL
        const tokenReserve = parsedData.parsed.info.tokenReserve;    // Nombre de tokens en réserve

        return { solReserve, tokenReserve };

    } catch (error) {
        console.error(`❌ Erreur lors de la récupération des réserves de la Bonding Curve pour ${bondingCurveAddress}:`, error);
        return null;
    }
};


export const getMarketCapFromBondingCurve = async (connection: Connection, bondingCurveAddress: string, totalSupply: number): Promise<number | null> => {
    try {
        const reserves = await getBondingCurveReserves(connection, bondingCurveAddress);
        if (!reserves) return null;

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

    } catch (error) {
        console.error(`❌ Erreur lors du calcul du Market Cap depuis la Bonding Curve:`, error);
        return null;
    }
};

