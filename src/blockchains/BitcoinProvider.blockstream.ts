// BitcoinProvider.blockstream.ts

import axios from "axios";
import * as bitcoin from "bitcoinjs-lib";
import * as bip39 from "bip39";

import { BlockchainProvider } from "./BlockchainProvider";


export class BitcoinProvider implements BlockchainProvider {
    private rpcUrl: string;
    private network: bitcoin.networks.Network | null = null;
    private keyPair: /* bitcoin.ECPair.ECPairInterface */ any | null = null;

    constructor(mnemonic=null) {
        this.rpcUrl = 'https://blockstream.info/api'; // URL de l'API Bitcoin RPC ou service tiers

        if (mnemonic) {
            const isTestnet = false;
            const seed = bip39.mnemonicToSeedSync(mnemonic);
            this.network = isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
            //const root = bitcoin.bip32.fromSeed(seed, isTestnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);
            //this.keyPair = bitcoin.ECPair.fromWIF(root.toWIF());
        }
    }

    getConnection() {
        return null;
    }

    async getWalletAddress(): Promise<string> {
        return ''; // TODO
    }

    // Récupérer la balance d'une adresse Bitcoin
    async getBalance(address: string, formatDecimals=true): Promise<number> {
        try {
            const response = await axios.get(`${this.rpcUrl}/address/${address}`);
            //console.log("data:", response.data); // Afficher les données pour déboguer si nécessaire

            // Calculer la balance nette
            const funded = response.data.chain_stats.funded_txo_sum || 0; // En satoshis
            const spent = response.data.chain_stats.spent_txo_sum || 0;   // En satoshis
            const balanceInSatoshis = funded - spent;

            if (! formatDecimals) {
                return balanceInSatoshis;
            }

            return balanceInSatoshis / 1e8; // Convertir en BTC

        } catch (error) {
            console.error("Error fetching Bitcoin balance:", error);
            throw new Error("Failed to fetch balance");
        }
    }

    // Non applicable pour Bitcoin natif (remplissage minimal pour respecter l'interface)
    async getTokenBalance(address: string, tokenAddress: string, formatDecimals=true): Promise<number> {
        console.warn("Tokens are not supported on Bitcoin natively.");
        return 0;
    }

    async getTokenPrice(tokenAddress: string): Promise<number> {
        console.warn("Tokens are not supported on Bitcoin natively.");
        return 0;
    }


    // Récupérer le statut d'une transaction
    async getTransactionStatus(txHash: string): Promise<string> {
        try {
            const response = await axios.get(`${this.rpcUrl}/tx/${txHash}`);
            const confirmations = response.data.confirmations;

            if (confirmations > 0) return "Success";
            return "Pending";
        } catch (error) {
            console.error("Error fetching transaction status:", error);
            throw new Error("Failed to fetch transaction status");
        }
    }

    async executeTransaction(to: string, value: string): Promise<string> {
        if (! this.keyPair || ! this.network) {
            throw new Error(`missing signer`);
        }

        try {
            // Conversion en satoshis
            const satoshis = Math.floor(Number(value) * 1e8);

            // Récupérer les UTXOs de l'adresse associée
            const address = bitcoin.payments.p2pkh({ pubkey: this.keyPair.publicKey, network: this.network }).address;
            const { data: utxos } = await axios.get(`https://blockstream.info/api/address/${address}/utxo`);

            if (!utxos || utxos.length === 0) {
                throw new Error("No UTXOs available for this address.");
            }

            // Construire la transaction
            const psbt = new bitcoin.Psbt({ network: this.network });

            let inputSum = 0;
            for (const utxo of utxos) {
                psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    nonWitnessUtxo: Buffer.from(utxo.raw, "hex"),
                });
                inputSum += utxo.value;
                if (inputSum >= satoshis) break;
            }

            // Ajouter la sortie (le destinataire)
            psbt.addOutput({
                address: to,
                value: satoshis,
            });

            // Ajouter une sortie pour la "change address" si nécessaire
            const fee = 1000; // Par exemple, 1000 satoshis
            const change = inputSum - satoshis - fee;
            if (change > 0) {
                psbt.addOutput({
                    address: address!,
                    value: change,
                });
            }

            // Signer la transaction
            psbt.signAllInputs(this.keyPair);
            psbt.finalizeAllInputs();

            // Récupérer la transaction en hex
            const transactionHex = psbt.extractTransaction().toHex();

            // Diffuser la transaction
            const { data: txId } = await axios.post("https://blockstream.info/api/tx", transactionHex);
            console.log(`Transaction sent: ${txId}`);
            return txId;

        } catch (error) {
            console.error("Error executing transaction on Bitcoin:", error);
            throw error;
        }
    }

    async swapTokens(inputMint: string, outputMint: string, amount: number, slippage: number, swapMode: string): Promise<string> {
        return '';
    }
}
