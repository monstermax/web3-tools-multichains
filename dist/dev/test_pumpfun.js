"use strict";
// test_pumpfun.ts
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
const pumpfun_1 = require("../blockchains/solana/pumpfun");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const ws = (0, pumpfun_1.getPumpPortalWebsocket)();
        ws.on('open', function open() {
            //subscribeNewToken(ws);
            //setTimeout(() => unsubscribeNewToken(ws), 30_000);
            //subscribeRaydiumLiquidity(ws);
            //subscribeAccountTrade(ws, ['8gJGq3JER74kGudebpQYBdHnuwEQMfe67K7jMPauFLeJ']);
            //setTimeout(() => unsubscribeAccountTrade(ws, ['8gJGq3JER74kGudebpQYBdHnuwEQMfe67K7jMPauFLeJ']), 10_000);
            //subscribeTokenTrade(ws, ['6NThGw29gUYjyqpw49KbSDe8kfREtSAzJF3YmXP7pump']);
            //setTimeout(() => unsubscribeTokenTrade(ws, ['6NThGw29gUYjyqpw49KbSDe8kfREtSAzJF3YmXP7pump']), 10_000);
        });
        ws.on('message', function message(data) {
            const message = JSON.parse(data.toString());
            //console.log('message:', message)
            if ('txType' in message) {
                if (message.txType === 'addLiquidity') {
                    onRadiumLiquidity(message);
                }
                else if (message.txType === 'create') {
                    onNewToken(message);
                }
                else if (message.txType === 'buy') {
                    onTokenTrade(message);
                }
                else if (message.txType === 'sell') {
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
    });
}
function onNewToken(message) {
    console.log('NewToken:', message);
}
function onTokenTrade(message) {
    console.log('Trade:', message);
}
function onRadiumLiquidity(message) {
    console.log('Liquidity:', message);
}
main();
//# sourceMappingURL=test_pumpfun.js.map