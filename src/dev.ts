
import { EvmProvider } from "./blockchains/EvmProvider";
import { SolanaProvider } from "./blockchains/SolanaProvider";
import { rpcDefault } from "./rpc.default";


async function main() {
    testBsc();

    testSolana();
}


async function testBsc(privateKey?: string) {
    console.log('== testBsc ==');
    const provider = new EvmProvider('bsc', rpcDefault.bsc.default, privateKey);

    const pairAddress = provider.getWrappedTokenUsdPair();
    console.log('tokenAddress:', pairAddress);

    const price = await provider.getTokensPairPrice(pairAddress, true);
    console.log('price:', price);
}


async function testSolana(privateKey?: string) {
    console.log('== testSolana ==');
    const provider = new SolanaProvider(rpcDefault.ethereum.publicnode);

    const balance = await provider.getBalance('Dwuj6toBNw6ti1BWqVxiD8Usj2XprucPp4YcKLiRxvso', true);
    console.log('balance:', balance);
}


main();

