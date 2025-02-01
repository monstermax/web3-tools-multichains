
import { describe, expect, test } from "@jest/globals";

import { rpcDefault, BlockchainProvider, EvmProvider, SolanaProvider , TonProvider, TronProvider} from "../src/index";
import fs from "fs";


test("Solana", async () => {
    const solana = new SolanaProvider(rpcDefault.ethereum.publicnode);
    const balance = await solana.getBalance('Dwuj6toBNw6ti1BWqVxiD8Usj2XprucPp4YcKLiRxvso', true);
    expect(balance).toBeGreaterThan(0);
});

