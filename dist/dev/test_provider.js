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
Object.defineProperty(exports, "__esModule", { value: true });
const EvmProvider_1 = require("../blockchains/EvmProvider");
const SolanaProvider_1 = require("../blockchains/SolanaProvider");
const rpc_default_1 = require("../rpc.default");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        testBsc();
        testSolana();
    });
}
function testBsc(privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('== testBsc ==');
        const provider = new EvmProvider_1.EvmProvider('bsc', rpc_default_1.rpcDefault.bsc.default, privateKey);
        const pairAddress = provider.getWrappedTokenUsdPair();
        console.log('tokenAddress:', pairAddress);
        const price = yield provider.getTokensPairPrice(pairAddress, true);
        console.log('price:', price);
    });
}
function testSolana(privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('== testSolana ==');
        const provider = new SolanaProvider_1.SolanaProvider(rpc_default_1.rpcDefault.ethereum.publicnode);
        const balance = yield provider.getBalance('Dwuj6toBNw6ti1BWqVxiD8Usj2XprucPp4YcKLiRxvso', true);
        console.log('balance:', balance);
    });
}
main();
//# sourceMappingURL=test_provider.js.map