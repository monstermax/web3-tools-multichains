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
            (0, pumpfun_1.subscribeNewToken)(ws);
            setTimeout(() => (0, pumpfun_1.unsubscribeNewToken)(ws), 30000);
        });
        ws.on('message', function message(data) {
            const message = JSON.parse(data.toString());
            //console.log('message:', message)
            if ('txType' in message && message.txType === 'create') {
                console.log('NewToken:', message);
            }
        });
        // Handle CTRL+C
        process.on('SIGINT', () => {
            console.log("\nCTRL+C detected. Stopping websocket...");
            ws.close();
            process.exit(0); // clean quit
        });
    });
}
main();
//# sourceMappingURL=test_pumpfun_snipe.js.map