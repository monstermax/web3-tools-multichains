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
exports.CoinPriceProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class CoinPriceProvider {
    // Récupérer le prix depuis CoinGecko
    static getTokenPriceFromCoinGecko(symbol_1) {
        return __awaiter(this, arguments, void 0, function* (symbol, currency = "usd") {
            var _a;
            try {
                const response = yield axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price`, {
                    params: { ids: symbol, vs_currencies: currency },
                });
                return ((_a = response.data[symbol]) === null || _a === void 0 ? void 0 : _a[currency]) || null;
            }
            catch (error) {
                console.error("Error fetching token price from CoinGecko:", error);
                return null;
            }
        });
    }
    // Récupérer le prix depuis Binance
    static getTokenPriceFromBinance(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`https://api.binance.com/api/v3/ticker/price`, {
                    params: { symbol: symbol.toUpperCase() },
                });
                return parseFloat(response.data.price);
            }
            catch (error) {
                console.error("Error fetching token price from Binance:", error);
                return null;
            }
        });
    }
    static getTokenPriceFromKraken(pair) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get("https://api.kraken.com/0/public/Ticker", { params: { pair } });
                const ticker = response.data.result[Object.keys(response.data.result)[0]];
                return parseFloat(ticker.c[0]);
            }
            catch (error) {
                console.error("Error fetching token price from Kraken:", error);
                return null;
            }
        });
    }
    static getTokenPriceFromCoinPaprika(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, currency = "usd") {
            var _a;
            try {
                const response = yield axios_1.default.get(`https://api.coinpaprika.com/v1/tickers/${id}`);
                return ((_a = response.data.quotes[currency.toUpperCase()]) === null || _a === void 0 ? void 0 : _a.price) || null;
            }
            catch (error) {
                console.error("Error fetching token price from CoinPaprika:", error);
                return null;
            }
        });
    }
    static getTokenPriceFromMessari(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`https://data.messari.io/api/v1/assets/${symbol}/metrics/market-data`);
                return response.data.data.market_data.price_usd || null;
            }
            catch (error) {
                console.error("Error fetching token price from Messari:", error);
                return null;
            }
        });
    }
    static getTokenPriceFromCoinbase(currencyPair) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`https://api.coinbase.com/v2/prices/${currencyPair}/spot`);
                return parseFloat(response.data.data.amount) || null;
            }
            catch (error) {
                console.error("Error fetching token price from Coinbase:", error);
                return null;
            }
        });
    }
    static getTokenPriceFromBitget(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get("https://api.bitget.com/api/v2/spot/market/tickers", {
                    params: { symbol },
                });
                return parseFloat(response.data.data[0].lastPr) || null;
            }
            catch (error) {
                console.error("Error fetching token price from Bitget:", error);
                return null;
            }
        });
    }
    static getTokenPriceFromBitpanda(symbol_1) {
        return __awaiter(this, arguments, void 0, function* (symbol, currency = "USD") {
            try {
                const response = yield axios_1.default.get("https://api.bitpanda.com/v1/ticker");
                return response.data[symbol][currency] || null;
            }
            catch (error) {
                console.error("Error fetching token price from Bitpanda:", error);
                return null;
            }
        });
    }
    static getTokenPriceFromCoinMarketCap(symbol_1) {
        return __awaiter(this, arguments, void 0, function* (symbol, currency = "USD") {
            throw new Error("missing apiKey");
            const apiKey = "YOUR_API_KEY";
            try {
                const response = yield axios_1.default.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest", {
                    headers: { "X-CMC_PRO_API_KEY": apiKey },
                    params: { symbol, convert: currency },
                });
                return response.data.data[symbol].quote[currency].price || null;
            }
            catch (error) {
                console.error("Error fetching token price from CoinMarketCap:", error);
                return null;
            }
        });
    }
}
exports.CoinPriceProvider = CoinPriceProvider;
//# sourceMappingURL=CoinPriceProvider.js.map