
import { describe, expect, test } from "@jest/globals";

import { rpcConfig, BlockchainProvider, EvmProvider, SolanaProvider , TonProvider, TronProvider} from "../src/index";
import fs from "fs";


test("Solana", async () => {
    const privateKey = fs.readFileSync('/tmp/wall').toString().trim();
    const solana = new SolanaProvider(rpcConfig.ethereum.publicnode, privateKey);
    //const balance = await solana.getBalance('Dwuj6toBNw6ti1BWqVxiD8Usj2XprucPp4YcKLiRxvso');
    const balance = await solana.getBalance('BFPcB3EN4i3FEHHLPq947LQWQkfYc15MbJ2UdhsGCW6x');
    console.log('balance:', balance)
    //expect(balance).toBe("0");
});

