// raydium.ts

import axios from "axios";


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



export async function getTokenPrice(tokenAddress: string) {
    const url = `https://api-v3.raydium.io/mint/price?mints=${tokenAddress}`;

    const response = await axios.get(url);

    return response.data[tokenAddress] as number;
}


export async function getTokensPrices(tokenAddresses: string[]) {
    const url = `https://api-v3.raydium.io/mint/price?mints=${tokenAddresses.join(',')}`;

    const response = await axios.get(url);

    return response.data as {[tokenAddress: string]: number};
}


