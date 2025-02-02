"use strict";
// raydium.ts
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
exports.getTokenPrice = getTokenPrice;
exports.getTokensPrices = getTokensPrices;
const axios_1 = __importDefault(require("axios"));
// https://docs.raydium.io/raydium/protocol/developers/apis
// https://api-v3.raydium.io/docs/
// https://api-v3.raydium.io/mint/price?mints=6AJcP7wuLwmRYLBNbi825wgguaPsWzPBEHcHndpRpump
// https://api-v3.raydium.io/mint/ids?mints=6AJcP7wuLwmRYLBNbi825wgguaPsWzPBEHcHndpRpump
// https://api-v3.raydium.io/pools/info/list?poolType=all&poolSortField=default&sortType=asc&pageSize=10&page=1
// https://api-v3.raydium.io/pools/info/ids?ids=zYj57Wcf8hzAwR7dE6g2MYVc9nNr8nBbGkj3LiNEPHv
// https://api-v3.raydium.io/pools/info/mint?mint1=So11111111111111111111111111111111111111112&poolType=all&poolSortField=default&sortType=asc&pageSize=10&page=1
// https://api-v3.raydium.io/pools/info/mint?mint1=So11111111111111111111111111111111111111112&mint2=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&poolType=all&poolSortField=default&sortType=asc&pageSize=10&page=1
// swap doc  : https://docs.raydium.io/raydium/traders/trade-api
// swap code : https://github.com/raydium-io/raydium-sdk-V2-demo/blob/master/src/api/swap.ts
function getTokenPrice(tokenAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api-v3.raydium.io/mint/price?mints=${tokenAddress}`;
        const response = yield axios_1.default.get(url);
        return response.data[tokenAddress];
    });
}
function getTokensPrices(tokenAddresses) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api-v3.raydium.io/mint/price?mints=${tokenAddresses.join(',')}`;
        const response = yield axios_1.default.get(url);
        return response.data;
    });
}
//# sourceMappingURL=raydium.js.map