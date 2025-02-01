import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
export declare function getTokenAccounts(walletPublicKey: PublicKey, inputMint: PublicKey, outputMint: PublicKey): Promise<{
    inputTokenAccount: PublicKey;
    outputTokenAccount: PublicKey;
}>;
export declare function getLpTokenMints(connection: Connection, lpAddress: string): Promise<{
    baseToken: string;
    quoteToken: string;
}>;
export declare function getPriorityFeeEstimate(rpcUrl: string, accountKeys: string[]): Promise<number>;
export declare function getTransactionPriorityFeeEstimate(rpcUrl: string, transaction: VersionedTransaction): Promise<number>;
export declare function isSetComputeUnitPriceInstruction(instruction: any, programId: PublicKey): boolean;
export declare function identifyInstructionType(instructionData: Uint8Array): string;
