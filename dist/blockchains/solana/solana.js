"use strict";
// solana.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenAccounts = getTokenAccounts;
exports.getLpTokenMints = getLpTokenMints;
exports.getPriorityFeeEstimate = getPriorityFeeEstimate;
exports.getTransactionPriorityFeeEstimate = getTransactionPriorityFeeEstimate;
exports.isSetComputeUnitPriceInstruction = isSetComputeUnitPriceInstruction;
exports.identifyInstructionType = identifyInstructionType;
const axios_1 = __importDefault(require("axios"));
const bs58_1 = __importDefault(require("bs58"));
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
function getTokenAccounts(walletPublicKey, inputMint, outputMint) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(inputMint, walletPublicKey);
        const outputTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(outputMint, walletPublicKey);
        return {
            inputTokenAccount,
            outputTokenAccount,
        };
    });
}
function getLpTokenMints(connection, lpAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Adresse de la paire LP (PublicKey)
            const lpPublicKey = new web3_js_1.PublicKey(lpAddress);
            // Lire les informations de compte pour la paire LP
            const accountInfo = yield connection.getAccountInfo(lpPublicKey);
            if (!(accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.data)) {
                throw new Error("Impossible de récupérer les données du compte LP.");
            }
            // Décoder les données de la paire LP (en supposant le layout de Raydium)
            const accountData = accountInfo.data;
            // Offsets pour Raydium :
            // `coinMint` : Offset 432
            // `pcMint` : Offset 400
            const baseToken = new web3_js_1.PublicKey(accountData.slice(432, 464)).toBase58();
            const quoteToken = new web3_js_1.PublicKey(accountData.slice(400, 432)).toBase58();
            return { baseToken, quoteToken };
        }
        catch (error) {
            console.error("Erreur lors de la récupération des tokens d'assets :", error);
            throw error;
        }
    });
}
function getPriorityFeeEstimate(rpcUrl, accountKeys) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const { data } = yield axios_1.default.post(rpcUrl, requestBody);
        //console.log('data:', data)
        if (data.error) {
            throw new Error(`RPC Error: ${data.error.message}`);
        }
        return data.result.priorityFeeEstimate; // Résultat en micro-lamports par compute unit
    });
}
function getTransactionPriorityFeeEstimate(rpcUrl, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(transaction instanceof web3_js_1.VersionedTransaction)) {
            throw new Error("Invalid transaction object: expected VersionedTransaction");
        }
        const requestBody = {
            jsonrpc: "2.0",
            id: 1,
            method: "getPriorityFeeEstimate",
            params: [
                {
                    transaction: bs58_1.default.encode(transaction.serialize()),
                    options: {
                        recommended: true,
                    },
                },
            ],
        };
        const { data } = yield axios_1.default.post(rpcUrl, requestBody);
        //console.log('data:', data)
        if (data.error) {
            console.error("RPC Error details:", data.error);
            throw new Error(`RPC Error: ${data.error.message}`);
        }
        return data.result.priorityFeeEstimate; // Résultat en micro-lamports par compute unit
    });
}
// Fonction pour vérifier si une instruction est de type `setComputeUnitPrice`
function isSetComputeUnitPriceInstruction(instruction, programId) {
    // Vérifiez si l'instruction provient du ComputeBudgetProgram
    if (!instruction || programId.toBase58() !== web3_js_1.ComputeBudgetProgram.programId.toBase58()) {
        return false;
    }
    // Identifier l'instruction spécifique avec son identifiant (01 pour setComputeUnitPrice)
    const dataPrefix = instruction.data.slice(0, 2); // Les 2 premiers octets identifient l'instruction
    return dataPrefix === "01"; // `01` correspond à `setComputeUnitPrice` (voir identifyInstructionType ci-dessous))
}
function identifyInstructionType(instructionData) {
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
//# sourceMappingURL=solana.js.map