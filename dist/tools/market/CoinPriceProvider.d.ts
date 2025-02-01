export declare class CoinPriceProvider {
    static getTokenPriceFromCoinGecko(symbol: string, currency?: string): Promise<number | null>;
    static getTokenPriceFromBinance(symbol: string): Promise<number | null>;
    static getTokenPriceFromKraken(pair: string): Promise<number | null>;
    static getTokenPriceFromCoinPaprika(id: string, currency?: string): Promise<number | null>;
    static getTokenPriceFromMessari(symbol: string): Promise<number | null>;
    static getTokenPriceFromCoinbase(currencyPair: string): Promise<number | null>;
    static getTokenPriceFromBitget(symbol: string): Promise<number | null>;
    static getTokenPriceFromBitpanda(symbol: string, currency?: string): Promise<number | null>;
    static getTokenPriceFromCoinMarketCap(symbol: string, currency?: string): Promise<number | null>;
}
