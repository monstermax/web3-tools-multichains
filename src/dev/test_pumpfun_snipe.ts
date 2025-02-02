// test_pumpfun.ts

import WebSocket from "ws";

import { getPumpPortalWebsocket, subscribeNewToken, unsubscribeNewToken } from "../blockchains/solana/pumpfun";

import type { CreateTokenResult } from "../blockchains/solana/pumpfun";


async function main() {
    const ws = getPumpPortalWebsocket();

    ws.on('open', function open() {
        subscribeNewToken(ws);

        setTimeout(() => unsubscribeNewToken(ws), 30_000);
    });

    ws.on('message', function message(data: WebSocket.Data) {
        const message = JSON.parse(data.toString()) as any;
        //console.log('message:', message)

        if ('txType' in message && message.txType === 'create') {
            console.log('NewToken:', message as CreateTokenResult);
        }
    });

    // Handle CTRL+C
    process.on('SIGINT', () => {
        console.log("\nCTRL+C detected. Stopping websocket...");
        ws.close();
        process.exit(0); // clean quit
    });
}


main();

