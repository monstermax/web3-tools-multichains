
import axios from "axios";


export class CoinPriceProvider {

    // Récupérer le prix depuis CoinGecko
    static async getTokenPriceFromCoinGecko(symbol: string, currency: string = "usd"): Promise<number | null> {
        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
                params: { ids: symbol, vs_currencies: currency },
            });
            return response.data[symbol]?.[currency] || null;

        } catch (error) {
            console.error("Error fetching token price from CoinGecko:", error);
            return null;
        }
    }

    // Récupérer le prix depuis Binance
    static async getTokenPriceFromBinance(symbol: string): Promise<number | null> {
        try {
            const response = await axios.get(`https://api.binance.com/api/v3/ticker/price`, {
                params: { symbol: symbol.toUpperCase() },
            });
            return parseFloat(response.data.price);

        } catch (error) {
            console.error("Error fetching token price from Binance:", error);
            return null;
        }
    }

    static async getTokenPriceFromKraken(pair: string): Promise<number | null> {
        try {
            const response = await axios.get("https://api.kraken.com/0/public/Ticker", { params: { pair } });
            const ticker = response.data.result[Object.keys(response.data.result)[0]];
            return parseFloat(ticker.c[0]);

        } catch (error) {
            console.error("Error fetching token price from Kraken:", error);
            return null;
        }
    }

    static async getTokenPriceFromCoinPaprika(id: string, currency: string = "usd"): Promise<number | null> {
        try {
            const response = await axios.get(`https://api.coinpaprika.com/v1/tickers/${id}`);
            return response.data.quotes[currency.toUpperCase()]?.price || null;

        } catch (error) {
            console.error("Error fetching token price from CoinPaprika:", error);
            return null;
        }
    }

    static async getTokenPriceFromMessari(symbol: string): Promise<number | null> {
        try {
            const response = await axios.get(`https://data.messari.io/api/v1/assets/${symbol}/metrics/market-data`);
            return response.data.data.market_data.price_usd || null;

        } catch (error) {
            console.error("Error fetching token price from Messari:", error);
            return null;
        }
    }

    static async getTokenPriceFromCoinbase(currencyPair: string): Promise<number | null> {
        try {
            const response = await axios.get(`https://api.coinbase.com/v2/prices/${currencyPair}/spot`);
            return parseFloat(response.data.data.amount) || null;

        } catch (error) {
            console.error("Error fetching token price from Coinbase:", error);
            return null;
        }
    }

    static async getTokenPriceFromBitget(symbol: string): Promise<number | null> {
        try {
            const response = await axios.get("https://api.bitget.com/api/v2/spot/market/tickers", {
                params: { symbol },
            });

            return parseFloat(response.data.data[0].lastPr) || null;

        } catch (error) {
            console.error("Error fetching token price from Bitget:", error);
            return null;
        }
    }

    static async getTokenPriceFromBitpanda(symbol: string, currency: string = "USD"): Promise<number | null> {
        try {
            const response = await axios.get("https://api.bitpanda.com/v1/ticker");

            return response.data[symbol][currency] || null;

        } catch (error) {
            console.error("Error fetching token price from Bitpanda:", error);
            return null;
        }
    }

    static async getTokenPriceFromCoinMarketCap(symbol: string, currency: string = "USD"): Promise<number | null> {
        throw new Error("missing apiKey");
        const apiKey = "YOUR_API_KEY";

        try {
            const response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest", {
                headers: { "X-CMC_PRO_API_KEY": apiKey },
                params: { symbol, convert: currency },
            });

            return response.data.data[symbol].quote[currency].price || null;

        } catch (error) {
            console.error("Error fetching token price from CoinMarketCap:", error);
            return null;
        }
    }

}

