// solana.ts

import axios from "axios";
import bs58 from "bs58";

import { getAssociatedTokenAddress } from "@solana/spl-token";
import { ComputeBudgetProgram, Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";



export async function getTokenAccounts(walletPublicKey: PublicKey, inputMint: PublicKey, outputMint: PublicKey) {
    const inputTokenAccount = await getAssociatedTokenAddress(inputMint, walletPublicKey);
    const outputTokenAccount = await getAssociatedTokenAddress(outputMint, walletPublicKey);

    return {
        inputTokenAccount,
        outputTokenAccount,
    };
}



export async function getLpTokenMints(
    connection: Connection,
    lpAddress: string
): Promise<{ baseToken: string; quoteToken: string }> {
    try {
        // Adresse de la paire LP (PublicKey)
        const lpPublicKey = new PublicKey(lpAddress);

        // Lire les informations de compte pour la paire LP
        const accountInfo = await connection.getAccountInfo(lpPublicKey);

        if (!accountInfo?.data) {
            throw new Error("Impossible de récupérer les données du compte LP.");
        }

        // Décoder les données de la paire LP (en supposant le layout de Raydium)
        const accountData = accountInfo.data;

        // Offsets pour Raydium :
        // `coinMint` : Offset 432
        // `pcMint` : Offset 400
        const baseToken = new PublicKey(accountData.slice(432, 464)).toBase58();
        const quoteToken = new PublicKey(accountData.slice(400, 432)).toBase58();

        return { baseToken, quoteToken };

    } catch (error) {
        console.error("Erreur lors de la récupération des tokens d'assets :", error);
        throw error;
    }
}


export async function getPriorityFeeEstimate(rpcUrl: string, accountKeys: string[]): Promise<number> {
    const requestBody = {
        jsonrpc: "2.0",
        id: 1,
        method: "getPriorityFeeEstimate",
        params: [
            {
                accountKeys,
                options: {
                    recommended: true,
                },
            },
        ],
    };

    const { data } = await axios.post(rpcUrl, requestBody) as any;
    //console.log('data:', data)

    if (data.error) {
        throw new Error(`RPC Error: ${data.error.message}`);
    }

    return data.result.priorityFeeEstimate as number; // Résultat en micro-lamports par compute unit
}


export async function getTransactionPriorityFeeEstimate(rpcUrl: string, transaction: VersionedTransaction): Promise<number> {
    if (!(transaction instanceof VersionedTransaction)) {
        throw new Error("Invalid transaction object: expected VersionedTransaction");
    }

    const requestBody = {
        jsonrpc: "2.0",
        id: 1,
        method: "getPriorityFeeEstimate",
        params: [
            {
                transaction: bs58.encode(transaction.serialize()),
                options: {
                    recommended: true,
                },
            },
        ],
    };

    const { data } = await axios.post(rpcUrl, requestBody) as any;
    //console.log('data:', data)

    if (data.error) {
        console.error("RPC Error details:", data.error);
        throw new Error(`RPC Error: ${data.error.message}`);
    }

    return data.result.priorityFeeEstimate as number; // Résultat en micro-lamports par compute unit
}


// Fonction pour vérifier si une instruction est de type `setComputeUnitPrice`
export function isSetComputeUnitPriceInstruction(instruction: any, programId: PublicKey): boolean {
    // Vérifiez si l'instruction provient du ComputeBudgetProgram
    if (!instruction || programId.toBase58() !== ComputeBudgetProgram.programId.toBase58()) {
        return false;
    }

    // Identifier l'instruction spécifique avec son identifiant (01 pour setComputeUnitPrice)
    const dataPrefix = instruction.data.slice(0, 2); // Les 2 premiers octets identifient l'instruction
    return dataPrefix === "01"; // `01` correspond à `setComputeUnitPrice` (voir identifyInstructionType ci-dessous))
}


export function identifyInstructionType(instructionData: Uint8Array): string {
    const instructionType = instructionData[0]; // Le premier octet identifie le type
    switch (instructionType) {
        case 1:
            return "setComputeUnitPrice";
        case 2:
            return "setComputeUnitLimit";
        case 3:
            return "anotherComputeBudgetConfig";
        default:
            return "unknown";
    }
}

