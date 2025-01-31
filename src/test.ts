
import { EvmProvider } from "./blockchains/EvmProvider";
import { rpcDefault } from "./rpc.default";


async function main() {
    testBsc();
}


async function testBsc(privateKey?: string) {
    const provider = new EvmProvider('bsc', rpcDefault.bsc.default, privateKey);

    const pairAddress = provider.getWrappedTokenUsdPair();
    console.log('tokenAddress:', pairAddress)

    const price = await provider.getTokensPairPrice(pairAddress, true);
    console.log('price:', price)
}


main();

