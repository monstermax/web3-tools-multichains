// transaction.utils.ts

import { AddressLookupTableAccount, Commitment, ComputeBudgetProgram } from "@solana/web3.js";
import { Connection, Keypair, SignatureResult, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

import { isSetComputeUnitPriceInstruction } from "./solana";

import type { LatestBlockhash } from "./solana.types";



export async function simulateTransaction(connection: Connection, transaction: VersionedTransaction): Promise<number | null> {
    try {
        const simulation = await connection.simulateTransaction(transaction, {
            sigVerify: false, // On n'a pas besoin de vérifier les signatures dans la simulation
        });

        //console.info('Simulation result:', JSON.stringify(simulation));

        if (simulation.value.err) {
            console.error('Simulation failed with error:', JSON.stringify(simulation.value.err));
            console.error('Simulation logs:', JSON.stringify(simulation.value.logs));
            throw new Error(`Simulation failed with error: ${JSON.stringify(simulation.value.err)}`);
        }

        //console.info('Transaction simulation logs:', JSON.stringify(simulation.value.logs));
        return simulation.value.unitsConsumed ?? null;

    } catch (err: any) {
        console.error(`Transaction simulation failed: ${err.message}`, { error: err });
        throw new Error(`Transaction simulation failed: ${err.message}`);
    }
}



export async function executeLegacyTransaction(connection: Connection, wallet: Keypair, transaction: Transaction): Promise<string> {
    if (!wallet) {
        throw new Error(`missing signer`);
    }

    try {
        const signature = await connection.sendTransaction(transaction, [wallet]);
        console.log(`Transaction sent: ${signature}`);

        //await connection.confirmTransaction(signature, "confirmed");
        //console.log(`Transaction confirmed: ${signature}`);

        return signature;

    } catch (err: any) {
        console.error("Error executing transaction on Solana:", err);
        throw err;
    }
}


export async function sendTransaction(connection: Connection, transaction: VersionedTransaction): Promise<string> {
    try {
        const rawTransaction = transaction.serialize()

        const signature = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: false,
            //maxRetries: 1,
            //preflightCommitment: "processed",
        });

        console.log(`Transaction sent: ${signature}`);

        //await connection.confirmTransaction(signature, "confirmed");
        //console.log(`Transaction confirmed: ${signature}`);

        return signature;

    } catch (err: any) {
        console.error("Error executing transaction on Solana:", err);
        throw err;
    }
}


export async function checkTransactionStatus(connection: Connection, txid: string): Promise<SignatureResult> {
    try {
        const confirmation = await connection.confirmTransaction(txid, 'confirmed');
        console.info(`Transaction confirmation response: ${JSON.stringify(confirmation)}`);

        if (confirmation.value.err) {
            console.error(`Transaction failed with error: ${JSON.stringify(confirmation.value.err)}`);
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }

        return confirmation.value;

    } catch (err: any) {
        console.error(`Transaction status check failed: ${err.message}`);
        throw new Error(`Transaction status check failed: ${err.message}`);

        // Error: Transaction status check failed: Transaction was not confirmed in 30.00 seconds. It is unknown if it succeeded or failed. Check signature 543ocqGKZBwVsbe5QzkBagjDFJbFZPVjGN1vZ9GwnhmA1mCDwtbvwv9oSvEos1xHmsgaJTaTBuShT24AjkY8DNf4 using the Solana Explorer or CLI tools.
    }
}


export async function confirmTransaction(connection: Connection, txid: string, latestBlockhash: LatestBlockhash, commitment: Commitment = "confirmed"): Promise<SignatureResult> {
    const { blockhash, lastValidBlockHeight } = latestBlockhash;

    const confirmation = await connection.confirmTransaction(
        {
            signature: txid,
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight,
        },
        commitment
    );

    if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    return confirmation.value;
}



export async function addTransactionFees(connection: Connection, wallet: Keypair, transaction: VersionedTransaction, priorityFeeMicroLamports: number) {
    // Notes (à revoir) :
    // - un swap jupiter doit contenir l'instruction suivante { computeUnitPriceMicroLamports: 0 } pour empecher que Jupiter n'ajoute les frais lui-meme
    // - un swap jupiter NE doit PAS contenir l'instruction suivante { prioritizationFeeLamports: any } pour ne pas contredire l'option computeUnitPriceMicroLamports


    // Vérifiez si une instruction ComputeBudgetProgram.setComputeUnitPrice existe déjà
    const computeUnitPriceIndex = transaction.message.compiledInstructions.findIndex(
        (instruction) => {
            if (!transaction) throw new Error(`missing transaction`);
            const programId = transaction.message.staticAccountKeys[instruction.programIdIndex];
            return isSetComputeUnitPriceInstruction(instruction, programId);
        }
    );


    // Récupérer les Address Lookup Tables utilisées dans la transaction
    const lookupTableKeys = transaction.message.addressTableLookups.map(
        (lookup) => lookup.accountKey
    );

    const lookupTableAccounts = await Promise.all(
        lookupTableKeys.map((key) => connection.getAddressLookupTable(key))
    );

    // Vérifier que toutes les tables sont résolues
    const resolvedTables = lookupTableAccounts
        .filter((res) => res.value !== null)
        .map((res) => res.value as AddressLookupTableAccount);

    if (resolvedTables.length !== lookupTableKeys.length) {
        throw new Error("Failed to resolve one or more Address Lookup Tables.");
    }


    if (computeUnitPriceIndex === -1) {
        // Si aucune instruction existante n'est trouvée, ajouter une nouvelle instruction
        console.log("Adding a new priority fee instruction.");

        const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: BigInt(Math.round(priorityFeeMicroLamports)), // En micro-lamports
        });

        // Extraire le message existant de la transaction
        const transactionMessage = TransactionMessage.decompile(transaction.message, { addressLookupTableAccounts: resolvedTables });

        // Ajouter l'instruction pour les priority fees au début ou à la fin des instructions existantes
        transactionMessage.instructions.unshift(priorityFeeInstruction); //    Ajouter au début
        // message.instructions.push(priorityFeeInstruction); // OU Ajouter à la fin

        // Reconstruire la transaction avec le message modifié
        const message0 = transactionMessage.compileToV0Message(resolvedTables); // Compiler vers un message version 0
        //message0.recentBlockhash = blockhash;

        transaction = new VersionedTransaction(message0);

        // Signer à nouveau la transaction après modification
        transaction.sign([wallet]);

        console.log("Added new priority fee instruction to the transaction.");
    }
}
