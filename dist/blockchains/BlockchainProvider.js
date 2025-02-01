"use strict";
// BlockchainProvider.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockchainProvider = getBlockchainProvider;
const BitcoinProvider_blockstream_1 = require("./BitcoinProvider.blockstream");
const EvmProvider_1 = require("./EvmProvider");
const SolanaProvider_1 = require("./SolanaProvider");
const TonProvider_1 = require("./TonProvider");
const TronProvider_1 = require("./TronProvider");
function getBlockchainProvider(chainName, options) {
    switch (chainName) {
        case 'bitcoin':
            const optionsBitcoin = options;
            return new BitcoinProvider_blockstream_1.BitcoinBlockstreamProvider(optionsBitcoin === null || optionsBitcoin === void 0 ? void 0 : optionsBitcoin.mnemonic);
        case 'ethereum':
        case 'bsc':
        case 'polygon':
        case 'fantom':
        case 'avalanche':
        case 'base':
            const optionsEvm = options;
            return new EvmProvider_1.EvmProvider(chainName, optionsEvm === null || optionsEvm === void 0 ? void 0 : optionsEvm.rpcUrl, optionsEvm === null || optionsEvm === void 0 ? void 0 : optionsEvm.privateKey);
        case 'solana':
            const optionsSolana = options;
            return new SolanaProvider_1.SolanaProvider(optionsSolana === null || optionsSolana === void 0 ? void 0 : optionsSolana.rpcUrl, optionsSolana === null || optionsSolana === void 0 ? void 0 : optionsSolana.privateKey);
        case 'ton':
            const optionsTon = options;
            return new TonProvider_1.TonProvider(optionsTon === null || optionsTon === void 0 ? void 0 : optionsTon.rpcUrl, optionsTon === null || optionsTon === void 0 ? void 0 : optionsTon.privateKey);
        case 'tron':
            const optionsTron = options;
            return new TronProvider_1.TronProvider(optionsTron === null || optionsTron === void 0 ? void 0 : optionsTron.rpcUrl, optionsTron === null || optionsTron === void 0 ? void 0 : optionsTron.privateKey);
        default:
            throw new Error(`chain ${chainName} not supported`);
    }
}
//# sourceMappingURL=BlockchainProvider.js.map