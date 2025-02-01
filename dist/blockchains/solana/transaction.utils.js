"use strict";
// transaction.utils.ts
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
exports.simulateTransaction = simulateTransaction;
exports.executeLegacyTransaction = executeLegacyTransaction;
exports.sendTransaction = sendTransaction;
exports.checkTransactionStatus = checkTransactionStatus;
exports.confirmTransaction = confirmTransaction;
exports.signSendAndConfirm = signSendAndConfirm;
exports.sendAndConfirmTransaction = sendAndConfirmTransaction;
exports.addTransactionFees = addTransactionFees;
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
const solana_1 = require("./solana");
function simulateTransaction(connection, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const simulation = yield connection.simulateTransaction(transaction, {
                sigVerify: false, // On n'a pas besoin de vérifier les signatures dans la simulation
            });
            //console.info('Simulation result:', JSON.stringify(simulation));
            if (simulation.value.err) {
                console.error('Simulation failed with error:', JSON.stringify(simulation.value.err));
                console.error('Simulation logs:', JSON.stringify(simulation.value.logs));
                throw new Error(`Simulation failed with error: ${JSON.stringify(simulation.value.err)}`);
            }
            //console.info('Transaction simulation logs:', JSON.stringify(simulation.value.logs));
            return (_a = simulation.value.unitsConsumed) !== null && _a !== void 0 ? _a : null;
        }
        catch (err) {
            console.error(`Transaction simulation failed: ${err.message}`, { error: err });
            throw new Error(`Transaction simulation failed: ${err.message}`);
        }
    });
}
function executeLegacyTransaction(connection, wallet, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!wallet) {
            throw new Error(`missing signer`);
        }
        try {
            const signature = yield connection.sendTransaction(transaction, [wallet]);
            console.log(`Transaction sent: ${signature}`);
            //await connection.confirmTransaction(signature, "confirmed");
            //console.log(`Transaction confirmed: ${signature}`);
            return signature;
        }
        catch (err) {
            console.error("Error executing transaction on Solana:", err);
            throw err;
        }
    });
}
function sendTransaction(connection, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rawTransaction = transaction.serialize();
            const signature = yield connection.sendRawTransaction(rawTransaction, {
                skipPreflight: false,
                //maxRetries: 1,
                //preflightCommitment: "processed",
            });
            console.log(`Transaction sent: ${signature}`);
            //await connection.confirmTransaction(signature, "confirmed");
            //console.log(`Transaction confirmed: ${signature}`);
            return signature;
        }
        catch (err) {
            console.error("Error executing transaction on Solana:", err);
            throw err;
        }
    });
}
function checkTransactionStatus(connection, txid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const confirmation = yield connection.confirmTransaction(txid, 'confirmed');
            console.info(`Transaction confirmation response: ${JSON.stringify(confirmation)}`);
            if (confirmation.value.err) {
                console.error(`Transaction failed with error: ${JSON.stringify(confirmation.value.err)}`);
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }
            return confirmation.value;
        }
        catch (err) {
            console.error(`Transaction status check failed: ${err.message}`);
            throw new Error(`Transaction status check failed: ${err.message}`);
            // Error: Transaction status check failed: Transaction was not confirmed in 30.00 seconds. It is unknown if it succeeded or failed. Check signature 543ocqGKZBwVsbe5QzkBagjDFJbFZPVjGN1vZ9GwnhmA1mCDwtbvwv9oSvEos1xHmsgaJTaTBuShT24AjkY8DNf4 using the Solana Explorer or CLI tools.
        }
    });
}
function confirmTransaction(connection_1, txid_1, latestBlockhash_1) {
    return __awaiter(this, arguments, void 0, function* (connection, txid, latestBlockhash, commitment = "confirmed") {
        const { blockhash, lastValidBlockHeight } = latestBlockhash;
        const confirmation = yield connection.confirmTransaction({
            signature: txid,
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight,
        }, commitment);
        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
        return confirmation.value;
    });
}
function signSendAndConfirm(connection, txData, signer) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = web3_js_2.VersionedTransaction.deserialize(new Uint8Array(txData));
        tx.sign([signer]);
        //console.log("   ✅ - Transaction Signed");
        return yield sendAndConfirmTransaction(connection, tx);
    });
}
function sendAndConfirmTransaction(connection, tx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const signature = yield connection.sendRawTransaction(tx.serialize(), {
            maxRetries: 10,
            skipPreflight: true,
        });
        console.log("   ✅ - Transaction sent to network");
        let tries = 10;
        while (tries-- >= 0) {
            const status = yield connection.getSignatureStatus(signature);
            if (((_a = status === null || status === void 0 ? void 0 : status.value) === null || _a === void 0 ? void 0 : _a.confirmationStatus) === "confirmed") {
                console.log("🎉 Transaction Succesfully Confirmed!", "\n", `https://solscan.io/tx/${signature}`);
                return signature;
            }
            console.log("   ⏳ - Waiting for transaction confirmation...");
            // wait 10 seconds
            yield new Promise((resolve) => setTimeout(resolve, 10000));
        }
        console.log("   ❌ - Transaction not confirmed.");
        return signature;
    });
}
function addTransactionFees(connection, wallet, transaction, priorityFeeMicroLamports) {
    return __awaiter(this, void 0, void 0, function* () {
        // Notes (à revoir) :
        // - un swap jupiter doit contenir l'instruction suivante { computeUnitPriceMicroLamports: 0 } pour empecher que Jupiter n'ajoute les frais lui-meme
        // - un swap jupiter NE doit PAS contenir l'instruction suivante { prioritizationFeeLamports: any } pour ne pas contredire l'option computeUnitPriceMicroLamports
        // Vérifiez si une instruction ComputeBudgetProgram.setComputeUnitPrice existe déjà
        const computeUnitPriceIndex = transaction.message.compiledInstructions.findIndex((instruction) => {
            if (!transaction)
                throw new Error(`missing transaction`);
            const programId = transaction.message.staticAccountKeys[instruction.programIdIndex];
            return (0, solana_1.isSetComputeUnitPriceInstruction)(instruction, programId);
        });
        // Récupérer les Address Lookup Tables utilisées dans la transaction
        const lookupTableKeys = transaction.message.addressTableLookups.map((lookup) => lookup.accountKey);
        const lookupTableAccounts = yield Promise.all(lookupTableKeys.map((key) => connection.getAddressLookupTable(key)));
        // Vérifier que toutes les tables sont résolues
        const resolvedTables = lookupTableAccounts
            .filter((res) => res.value !== null)
            .map((res) => res.value);
        if (resolvedTables.length !== lookupTableKeys.length) {
            throw new Error("Failed to resolve one or more Address Lookup Tables.");
        }
        if (computeUnitPriceIndex === -1) {
            // Si aucune instruction existante n'est trouvée, ajouter une nouvelle instruction
            console.log("Adding a new priority fee instruction.");
            const priorityFeeInstruction = web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: BigInt(Math.round(priorityFeeMicroLamports)), // En micro-lamports
            });
            // Extraire le message existant de la transaction
            const transactionMessage = web3_js_2.TransactionMessage.decompile(transaction.message, { addressLookupTableAccounts: resolvedTables });
            // Ajouter l'instruction pour les priority fees au début ou à la fin des instructions existantes
            transactionMessage.instructions.unshift(priorityFeeInstruction); //    Ajouter au début
            // message.instructions.push(priorityFeeInstruction); // OU Ajouter à la fin
            // Reconstruire la transaction avec le message modifié
            const message0 = transactionMessage.compileToV0Message(resolvedTables); // Compiler vers un message version 0
            //message0.recentBlockhash = blockhash;
            transaction = new web3_js_2.VersionedTransaction(message0);
            // Signer à nouveau la transaction après modification
            transaction.sign([wallet]);
            console.log("Added new priority fee instruction to the transaction.");
        }
    });
}
//# sourceMappingURL=transaction.utils.js.map