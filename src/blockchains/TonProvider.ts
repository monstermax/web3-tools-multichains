// TonProvider.ts

import TonWeb from "tonweb";

import { BlockchainProvider } from "./BlockchainProvider";
import { WalletV3ContractR2 } from "tonweb/dist/types/contract/wallet/v3/wallet-v3-contract-r2";


export class TonProvider implements BlockchainProvider {
    private connection: TonWeb;
    private privateKey: string | null = null;
    private signer: WalletV3ContractR2 | null = null;

    constructor(rpcUrl?: string, privateKey?: string) {
        rpcUrl = rpcUrl || "https://toncenter.com/api/v2/jsonRPC";
        this.connection = new TonWeb(new TonWeb.HttpProvider(rpcUrl));

        if (privateKey) {
            this.privateKey = privateKey;
            this.initializeSigner(privateKey);
        }
    }


    private initializeSigner(privateKey: string) {
        try {
            // Convertir la clé privée en Uint8Array
            const keyBuffer = Buffer.from(privateKey, "hex");
            const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(keyBuffer);

            // Définir le type de wallet (ici Wallet V3)
            const WalletClass = this.connection.wallet.all['v3R2'];

            // Créer le wallet TON à partir de la clé publique
            this.signer = new WalletClass(this.connection.provider, {
                publicKey: keyPair.publicKey
            });

            console.log("Signer (wallet) initialisé avec succès !");

        } catch (error) {
            console.error("Erreur lors de l'initialisation du signer:", error);
            this.signer = null;
        }
    }


    getConnection() {
        return this.connection;
    }


    async getWalletAddress(): Promise<string> {
        try {
            if (!this.signer) {
                throw new Error("Signer non initialisé");
            }

            const address = await this.signer.getAddress();
            return address.toString();

        } catch (error) {
            console.error("Erreur lors de la récupération de l'adresse du wallet:", error);
            return "";
        }
    }


    // Obtenir le solde d'une adresse TON
    async getBalance(address: string, formatDecimals = true): Promise<number> {
        try {
            const wallet = this.connection.wallet.create({ address });
            const balance = await this.connection.getBalance(wallet.address ?? '');

            if (!formatDecimals) {
                return Number(balance);
            }

            return Number(balance) / 1e9; // Convertir en TON

        } catch (error) {
            console.error("Error fetching TON balance:", error);
            return 0;
        }
    }


    // Méthode pour récupérer le solde d'un token TIP-3
    async getTokenBalance(address: string, tokenAddress: string, formatDecimals = true): Promise<number> {
        try {
            const result = await this.connection.provider.call2(
                tokenAddress,  // Adresse du contrat
                'getBalance',  // Nom de la méthode
                [['address', address]]  // Paramètres sous forme de tuple
            );

            const balance = parseInt(result.stack[0][1], 10);
            return formatDecimals ? balance / 1e9 : balance;

        } catch (error) {
            console.error("Error fetching token balance on TON:", error);
            return 0;
        }
    }


    // Statut d'une transaction
    async getTransactionStatus(txHash: string): Promise<string> {
        try {
            const txInfo = await this.connection.provider.call2(
                txHash, // Adresse de la transaction
                'getStatus',
                []
            );

            return txInfo.stack[0][1] === '1' ? "Confirmed" : "Pending";

        } catch (error) {
            console.error("Error fetching transaction status:", error);
            return "Unknown";
        }
    }


    // Prix du token (par exemple : TON/USD)
    async getTokenPrice(pairAddress: string): Promise<number> {
        try {
            // Récupérer les adresses des tokens du pool
            const tokenData = await this.connection.provider.call2(pairAddress, 'getTokens', []);
            const token0Address = tokenData.stack[0][1];
            const token1Address = tokenData.stack[1][1];

            // Récupérer les réserves
            const reservesData = await this.connection.provider.call2(pairAddress, 'getReserves', []);
            const reserve0 = parseInt(reservesData.stack[0][1], 10);
            const reserve1 = parseInt(reservesData.stack[1][1], 10);

            // Conversion en décimales (supposons 9 décimales par défaut)
            const adjustedReserve0 = reserve0 / 1e9;
            const adjustedReserve1 = reserve1 / 1e9;

            return adjustedReserve1 / adjustedReserve0;

        } catch (error) {
            console.error("Error fetching LP token price:", error);
            return 0;
        }
    }


    async executeTransaction(to: string, value: string): Promise<string> {
        try {
            if (!this.privateKey || !this.signer) {
                throw new Error("Signer non initialisé. Impossible d'envoyer une transaction.");
            }

            // Convertir la valeur en nanotons (TON a 9 décimales)
            const amountInNanotons = TonWeb.utils.toNano(value);
            const secretKey = Buffer.from(this.privateKey, "hex");

            // Créer la transaction
            const tx = await this.signer.methods.transfer({
                secretKey, // Clé privée du wallet
                toAddress: to, // Adresse du destinataire
                amount: amountInNanotons, // Montant en nanotons
                seqno: (await this.signer.methods.seqno().call()) || 0, // Récupérer le numéro de séquence
                payload: "", // Message optionnel
            }).send();

            console.log("Transaction envoyée. TX Hash:", tx);

            return tx; // Retourne l'identifiant de la transaction (TX Hash)

        } catch (error) {
            console.error("Erreur lors de l'exécution de la transaction sur TON:", error);
            return "";
        }
    }


    async swapTokens(inputMint: string, outputMint: string, amount: number, slippage: number, swapMode: string): Promise<string> {
        return ''; // TODO
    }
}
