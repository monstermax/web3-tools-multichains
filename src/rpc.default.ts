
// https://drpc.org/blog/10-best-rpc-node-providers/

// https://docs.pokt.network/developers/public-endpoints


export const rpcConfig: {[network: string]: {[provider: string]: string}} = {
    bitcoin: {
        tatum: "https://bitcoin-mainnet.gateway.tatum.io/",
    },
    ethereum: {
        tatum: "https://ethereum-mainnet.gateway.tatum.io/",
        pokt: "https://eth-pokt.nodies.app/",
    },
    solana: {
        default: "https://api.mainnet-beta.solana.com",
        tatum: "https://solana-mainnet.gateway.tatum.io/",
        ankr: "https://rpc.ankr.com/solana",
    },
}

