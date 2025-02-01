"use strict";
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
exports.TokenPriceProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class TokenPriceProvider {
    static getDexscreenerPrice(chain, pairAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://docs.dexscreener.com/api/reference#latest-dex-pairs-chainid-pairid
            // https://api.dexscreener.com/latest/dex/pairs/{chainId}/{pairId}
            // https://api.dexscreener.com/latest/dex/pairs/solana/9vWVooeqk6udEHyioYr8Lvz6n8VZ45TkgKCtvneEVHCY
            var _a;
            // https://docs.dexscreener.com/api/reference#token-pairs-v1-chainid-tokenaddress
            // https://api.dexscreener.com/token-pairs/v1/{chainId}/{tokenAddress}
            try {
                const response = yield axios_1.default.get(`https://api.dexscreener.io/latest/dex/pairs/${chain}/${pairAddress}`);
                return Number((_a = response.data.pair) === null || _a === void 0 ? void 0 : _a.priceUsd) || null;
            }
            catch (error) {
                console.error("Error fetching price from Dexscreener:", error);
                return null;
            }
        });
    }
    static getCoingeckoTerminalPrice(chain, pairAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://www.geckoterminal.com/dex-api
            // https://api.geckoterminal.com/api/v2/networks/solana/pools/9vWVooeqk6udEHyioYr8Lvz6n8VZ45TkgKCtvneEVHCY
            var _a;
            try {
                const response = yield axios_1.default.get(`https://api.geckoterminal.com/api/v2/networks/${chain}/pools/${pairAddress}`);
                return Number((_a = response.data.data.attributes) === null || _a === void 0 ? void 0 : _a.base_token_price_usd) || null;
            }
            catch (error) {
                console.error("Error fetching price from Dexscreener:", error);
                return null;
            }
        });
    }
    static getBirdEyePrice(chain, pairAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // Utilisation de l'API BirdEye
            // Endpoint : https://public-api.birdeye.so/public/price?address={pairAddress}
            var _a;
            throw new Error("missing apiKey");
            const apiKey = "YOUR_API_KEY";
            const options = {
                method: "GET",
                headers: {
                    accept: "application/json",
                    "x-chain": chain, // Choisir le réseau (par exemple : "solana")
                    "x-api-key": apiKey,
                },
            };
            try {
                const response = yield axios_1.default.get(`https://public-api.birdeye.so/public/price?address=${pairAddress}`, { headers: options.headers });
                return Number((_a = response.data.data) === null || _a === void 0 ? void 0 : _a.price) || null;
            }
            catch (error) {
                console.error("Error fetching price from BirdEye:", error);
                return null;
            }
        });
    }
}
exports.TokenPriceProvider = TokenPriceProvider;
//# sourceMappingURL=TokenPriceProvider.js.map