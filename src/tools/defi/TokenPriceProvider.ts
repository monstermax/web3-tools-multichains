
import axios from "axios";


// https://api.geckoterminal.com/api/v2/networks?page=1
type CoingeckoTerminalNetworkName = 'eth' | 'bsc' | 'polygon_pos' | 'avax' | 'movr' | 'cro' | 'one' | 'boba' | 'ftm' | 'bch' | 'aurora' | 'metis' | 'arbitrum' | 'fuse' | 'kcc' | 'iotx' | 'celo' | 'xdai' | 'glmr' | 'optimism' | 'nrg' | 'wan' | 'ronin' | 'kai' | 'mtr' | 'velas' | 'sdn' | 'tlos' | 'sys' | 'oasis' | 'astr' | 'ela' | 'milkada' | 'dfk' | 'evmos' | 'solana' | 'cfx' | 'bttc' | 'sxn' | 'xdc' | 'kaia' | 'kava' | 'bitgert' | 'tombchain' | 'dogechain' | 'findora' | 'thundercore' | 'arbitrum_nova' | 'canto' | 'ethereum_classic' | 'step-network' | 'ethw' | 'godwoken' | 'songbird' | 'tomochain' | 'fx' | 'platon_network' | 'exosama' | 'oasys' | 'bitkub_chain' | 'wemix' | 'flare' | 'onus' | 'aptos' | 'core' | 'filecoin' | 'zksync' | 'loopnetwork' | 'multivac' | 'polygon-zkevm' | 'eos-evm' | 'ultron' | 'sui-network' | 'pulsechain' | 'enuls' | 'tenet' | 'rollux' | 'starknet-alpha' | 'mantle' | 'neon-evm' | 'linea' | 'base' | 'bitrock' | 'opbnb' | 'sei-network' | 'shibarium' | 'manta-pacific' | 'sepolia-testnet' | 'hedera-hashgraph' | 'shimmerevm' | 'beam' | 'scroll' | 'lightlink-phoenix' | 'elysium' | 'ton' | 'mode' | 'defimetachain' | 'humanode' | 'mxc-zkevm' | 'zkfair';

type DexScreenerNetworkName = 'solana' | 'ethereum' | 'base' | 'bsc' | 'sui' | 'ton' | 'xrpl' | 'pulsechain' | 'hyperliquid' | 'polygon' | 'arbitrum' | 'avalanche' | 'sonic' | 'cronos' | 'osmosis' | 'tron' | 'hedera' | 'fantom' | 'aptos' | 'near' | 'zksync' | 'algorand' | 'icp' | 'blast' | 'optimism' | 'multiversx' | 'linea' | 'cardano' | 'apechain' | 'ink' | 'flowevm' | 'starknet' | 'injective' | 'mantle' | 'worldchain' | 'dogechain' | 'seiv2' | 'shibarium' | 'metis' | 'mode' | 'conflux' | 'vana' | 'soneium' | 'beam' | 'scroll' | 'flare' | 'merlinchain' | 'polkadot' | 'oasissapphire' | 'canto' | 'moonbeam' | 'energi' | 'manta' | 'ethereumpow' | 'harmony' | 'zircuit' | 'degenchain' | 'kava' | 'avalanchedfk' | 'polygonzkevm' | 'unichain' | 'celo' | 'iotex' | 'zora' | 'filecoin' | 'bouncebit' | 'ethereumclassic' | 'opbnb' | 'telos' | 'venom' | 'velas' | 'fuse' | 'gnosischain' | 'moonriver' | 'astar' | 'zetachain' | 'core' | 'taiko' | 'aurora' | 'elastos' | 'fraxtal' | 'smartbch' | 'evmos' | 'combo' | 'meter' | 'stepnetwork' | 'zkfair' | 'neonevm' | 'arbitrumnova' | 'bitgert' | 'boba' | 'milkomedacardano' | 'oasisemerald' | 'thundercore' | 'godwoken' | 'kcc' | 'loopnetwork' | 'sei' | 'sxnetwork' | 'syscoin' | 'wanchain';


// https://docs.birdeye.so/reference/getdefinetworks
type BirdEyeNetworkName = 'solana' | 'ethereum' | 'arbitrum' | 'avalanche' | 'bsc' | 'optimism' | 'polygon' | 'base' | 'zksync' | 'sui';



export class TokenPriceProvider {
    static async getDexscreenerPrice(chain: DexScreenerNetworkName, pairAddress: string): Promise<number | null> {
        // https://docs.dexscreener.com/api/reference#latest-dex-pairs-chainid-pairid
        // https://api.dexscreener.com/latest/dex/pairs/{chainId}/{pairId}
        // https://api.dexscreener.com/latest/dex/pairs/solana/9vWVooeqk6udEHyioYr8Lvz6n8VZ45TkgKCtvneEVHCY

        // https://docs.dexscreener.com/api/reference#token-pairs-v1-chainid-tokenaddress
        // https://api.dexscreener.com/token-pairs/v1/{chainId}/{tokenAddress}

        try {
            const response = await axios.get(`https://api.dexscreener.io/latest/dex/pairs/${chain}/${pairAddress}`);
            return Number(response.data.pair?.priceUsd) || null;

        } catch (error) {
            console.error("Error fetching price from Dexscreener:", error);
            return null;
        }
    }

    static async getCoingeckoTerminalPrice(chain: CoingeckoTerminalNetworkName, pairAddress: string): Promise<number | null> {
        // https://www.geckoterminal.com/dex-api
        // https://api.geckoterminal.com/api/v2/networks/solana/pools/9vWVooeqk6udEHyioYr8Lvz6n8VZ45TkgKCtvneEVHCY

        try {
            const response = await axios.get(`https://api.geckoterminal.com/api/v2/networks/${chain}/pools/${pairAddress}`);
            return Number(response.data.data.attributes?.base_token_price_usd) || null;

        } catch (error) {
            console.error("Error fetching price from Dexscreener:", error);
            return null;
        }
    }

    static async getBirdEyePrice(chain: BirdEyeNetworkName, pairAddress: string): Promise<number | null> {
        // Utilisation de l'API BirdEye
        // Endpoint : https://public-api.birdeye.so/public/price?address={pairAddress}

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
            const response = await axios.get(`https://public-api.birdeye.so/public/price?address=${pairAddress}`, { headers: options.headers });
            return Number(response.data.data?.price) || null;

        } catch (error) {
            console.error("Error fetching price from BirdEye:", error);
            return null;
        }
    }
}
