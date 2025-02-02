export declare function getTokenPrice(tokenAddress: string): Promise<number>;
export declare function getTokensPrices(tokenAddresses: string[]): Promise<{
    [tokenAddress: string]: number;
}>;
