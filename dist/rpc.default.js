"use strict";
// https://www.publicnode.com/
// https://drpc.org/blog/10-best-rpc-node-providers/
// https://docs.pokt.network/developers/public-endpoints
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpcDefault = void 0;
exports.rpcDefault = {
    bitcoin: {
        publicnode: "https://bitcoin-rpc.publicnode.com",
        tatum: "https://bitcoin-mainnet.gateway.tatum.io/",
    },
    ethereum: {
        publicnode: "https://ethereum-rpc.publicnode.com",
        pokt: "https://eth-pokt.nodies.app/",
        tatum: "https://ethereum-mainnet.gateway.tatum.io/",
    },
    bsc: {
        default: "https://bsc-dataseed1.binance.org/",
        publicnode: "https://bsc-rpc.publicnode.com",
    },
    polygon: {
        publicnode: "https://polygon-rpc.com/",
    },
    fantom: {
        publicnode: "https://rpcapi.fantom.network",
    },
    avalanche: {
        publicnode: "https://api.avax.network/ext/bc/C/rpc",
    },
    base: {
        publicnode: "https://base-rpc.publicnode.com",
    },
    arbitrum: {
        publicnode: "https://arbitrum-one-rpc.publicnode.com",
    },
    optimism: {
        publicnode: "https://optimism-rpc.publicnode.com",
    },
    solana: {
        default: "https://api.mainnet-beta.solana.com",
        publicnode: "https://solana-rpc.publicnode.com",
        tatum: "https://solana-mainnet.gateway.tatum.io/",
        ankr: "https://rpc.ankr.com/solana",
    },
};
//# sourceMappingURL=rpc.default.js.map