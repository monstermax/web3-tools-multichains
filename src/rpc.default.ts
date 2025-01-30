
// https://www.publicnode.com/
// https://drpc.org/blog/10-best-rpc-node-providers/
// https://docs.pokt.network/developers/public-endpoints


export const rpcConfig = {
    bitcoin: {
        publicnode: "https://solana-rpc.publicnode.com",
        tatum: "https://bitcoin-mainnet.gateway.tatum.io/",
    },
    ethereum: {
        publicnode: "https://ethereum-rpc.publicnode.com",
        pokt: "https://eth-pokt.nodies.app/",
        tatum: "https://ethereum-mainnet.gateway.tatum.io/",
    },
    solana: {
        default: "https://api.mainnet-beta.solana.com",
        publicnode: "https://solana-rpc.publicnode.com",
        tatum: "https://solana-mainnet.gateway.tatum.io/",
        ankr: "https://rpc.ankr.com/solana",
    },
}

