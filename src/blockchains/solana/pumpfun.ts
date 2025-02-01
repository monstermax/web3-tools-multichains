// pumpfun.ts

import fs from "fs";
import axios from "axios";
import WebSocket from "ws";
import bs58 from "bs58";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";


// https://pumpportal.fun/data-api/real-time
// https://github.com/thetateman/Pump-Fun-API

// https://blogs.shyft.to/how-to-track-token-transfers-from-pump-fun-to-raydium-5ada83c2ac58
// https://github.com/Shyft-to/solana-defi/blob/main/PumpFun/Typescript/%5BGRPC%5DPumpfun_migration/index.ts

// pump snipe : https://github.com/whistledev411/pumpfun-sniper/blob/master/src/index.ts

// serial token creator ? : 8gJGq3JER74kGudebpQYBdHnuwEQMfe67K7jMPauFLeJ


type Payload = {
    method: string,
    keys?: string[],
}

type SubscribeResult = { message: string };
type UnsubscribeResult = { message: string };

type CreateTokenResult = {
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

type TokenTradeResult = {
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

type CreateWalletResult = {
    apiKey: string
    walletPublicKey: string
    privateKey: string
};

type RaydiumLiquidityResult = {
    signature: string
    mint: string
    txType: 'addLiquidity'
    marketId: string
    marketCapSol: number
    price: number
    pool: string
}

type CreateTokenOptions = {
    name: string,
    imageFile?: string,
    symbol: string,
    description: string,
    twitter?: string,
    telegram?: string,
    website?: string,
    solAmount: number,
}

type SendPortalTransactionOptions = {
    tokenAddress: string,
    orderType: 'buy' | 'sell',
    amount: BigInt,
}




//const tokensTxCount: { [address: string]: number } = {};
//const tradersTxCount: { [address: string]: number } = {};
//const devsTokenCount: { [address: string]: number } = {};


async function main() {
    /*
    const wss = new WebSocket('wss://prod-v2.nats.realtime.pump.fun/');

    wss.on('message', (data: WebSocket.Data) => {
        console.log('message:', data.toString())
    })

    wss.on('open', () => {
        const message = '{"no_responders":true,"protocol":1,"verbose":false,"pedantic":false,"user":"subscriber","pass":"lW5a9y20NceF6AE9","lang":"nats.ws","version":"1.29.2","headers":true}';
        wss.send(message);
    })

    return;
    */

    const ws = getPumpPortalWebsocket();

    ws.on('open', function open() {
        //subscribeNewToken(ws);
        //setTimeout(() => unsubscribeNewToken(ws), 30_000);

        //subscribeRaydiumLiquidity(ws);

        //subscribeAccountTrade(ws, ['8gJGq3JER74kGudebpQYBdHnuwEQMfe67K7jMPauFLeJ']);
        //setTimeout(() => unsubscribeAccountTrade(ws, ['8gJGq3JER74kGudebpQYBdHnuwEQMfe67K7jMPauFLeJ']), 10_000);

        //subscribeTokenTrade(ws, ['6NThGw29gUYjyqpw49KbSDe8kfREtSAzJF3YmXP7pump']);
        //setTimeout(() => unsubscribeTokenTrade(ws, ['6NThGw29gUYjyqpw49KbSDe8kfREtSAzJF3YmXP7pump']), 10_000);
    });

    ws.on('message', function message(data: WebSocket.Data) {
        const message = JSON.parse(data.toString()) as CreateTokenResult | TokenTradeResult | RaydiumLiquidityResult;
        console.log('message:', message)

        if (message.txType === 'addLiquidity') {
            onRadiumLiquidity(message);

        } else if (message.txType === 'create') {
            onNewToken(message);

        } else if (message.txType === 'buy') {
            onTokenTrade(message);

        } else if (message.txType === 'sell') {
            onTokenTrade(message);
        }
    });

    // Gestion propre de CTRL+C
    process.on('SIGINT', () => {
        console.log("\nCTRL+C detected. Stopping websocket...");
        ws.close();
        process.exit(0); // Quitter proprement
    });
}



function onNewToken(message: CreateTokenResult) {
    
}

function onTokenTrade(message: TokenTradeResult) {
    
}

function onRadiumLiquidity(message: RaydiumLiquidityResult) {
    
}



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

        const signature = await connection.sendTransaction(tx)
        console.log("Transaction: https://solscan.io/tx/" + signature);

    } else {
        console.log(response.statusText); // log error
    }
}


export async function sendPortalTransaction(connection: Connection, privateKey: string, walletAddress: string, options: SendPortalTransactionOptions) {
    const response = await axios.post(`https://pumpportal.fun/api/trade-local`,
        JSON.stringify({
            "publicKey": walletAddress,  // Your wallet public key
            "action": options.orderType,                 // "buy" or "sell"
            "mint": options.tokenAddress,         // contract address of the token you want to trade
            "denominatedInSol": "false",     // "true" if amount is amount of SOL, "false" if amount is number of tokens
            "amount": options.amount.toString(),                  // amount of SOL or tokens
            "slippage": 1,                   // percent slippage allowed
            "priorityFee": 0.00001,          // priority fee
            "pool": "pump"                   // exchange to trade on. "pump" or "raydium"
        })
        , {
            headers: {
                "Content-Type": "application/json"
            }
        });

    if (response.status === 200) { // successfully generated transaction
        const data = response.data;

        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        const signerKeyPair = Keypair.fromSecretKey(bs58.decode(privateKey));
        tx.sign([signerKeyPair]);

        const signature = await connection.sendTransaction(tx)
        console.log("Transaction: https://solscan.io/tx/" + signature);

    } else {
        console.log(response.statusText); // log error
    }
}


main();

