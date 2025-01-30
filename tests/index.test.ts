
import { describe, expect, test } from "@jest/globals";

import { rpcConfig, BlockchainProvider, EvmProvider, SolanaProvider , TonProvider, TronProvider} from "../src/index";


test("Solana", async () => {
    const solana = new SolanaProvider(rpcConfig.ethereum.publicnode);
    const balance = await solana.getBalance('Dwuj6toBNw6ti1BWqVxiD8Usj2XprucPp4YcKLiRxvso');
    console.log('balance:', balance)
    //expect(balance).toBe("0");
});

