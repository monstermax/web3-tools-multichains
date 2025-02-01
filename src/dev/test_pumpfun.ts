// test_pumpfun.ts

import WebSocket from "ws";

import { getPumpPortalWebsocket } from "../blockchains/solana/pumpfun";

import type { CreateTokenResult, RaydiumLiquidityResult, SubscribeResult, TokenTradeResult } from "../blockchains/solana/pumpfun";


async function main() {
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
        const message = JSON.parse(data.toString()) as CreateTokenResult | TokenTradeResult | RaydiumLiquidityResult | SubscribeResult;
        //console.log('message:', message)

        if ('txType' in message) {
            if (message.txType === 'addLiquidity') {
                onRadiumLiquidity(message);

            } else if (message.txType === 'create') {
                onNewToken(message);

            } else if (message.txType === 'buy') {
                onTokenTrade(message);

            } else if (message.txType === 'sell') {
                onTokenTrade(message);
            }
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
    console.log('NewToken:', message)
}

function onTokenTrade(message: TokenTradeResult) {
    console.log('Trade:', message)
}

function onRadiumLiquidity(message: RaydiumLiquidityResult) {
    console.log('Liquidity:', message)
}




main();

