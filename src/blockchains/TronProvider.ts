// TronProvider.ts

import { TronWeb } from "tronweb";

import { BlockchainProvider } from "./BlockchainProvider";
import { AbiFragment } from "tronweb/lib/esm/types";


const LP_ABI = [
    {
        constant: true,
        inputs: [],
        name: "getReserves",
        outputs: [
            { name: "_reserve0", type: "uint112" },
            { name: "_reserve1", type: "uint112" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "token0",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "token1",
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
];


export class TronProvider implements BlockchainProvider {
    private connection: TronWeb;
    private signer: string | null = null;

    constructor(rpcUrl?: string, privateKey?: string) {
        const fullNodeUrl = rpcUrl || "https://api.trongrid.io";
        const eventServerUrl = rpcUrl || "https://api.trongrid.io";
        const solidityNodeUrl = rpcUrl || "https://api.trongrid.io";

        this.connection = new TronWeb({
            fullHost: fullNodeUrl,
            eventServer: eventServerUrl,
            solidityNode: solidityNodeUrl,
            privateKey: privateKey || undefined,
        });

        if (privateKey) {
            this.signer = this.connection.address.fromPrivateKey(privateKey) || null;
            console.log("Signer initialisé :", this.signer);
        }
    }


    getConnection() {
        return this.connection;
    }


    async getWalletAddress(): Promise<string> {
        try {
            if (!this.signer) {
                throw new Error("Aucune clé privée fournie, impossible de récupérer l'adresse.");
            }
            return this.signer;
        } catch (error) {
            console.error("Erreur lors de la récupération de l'adresse du wallet:", error);
            return "";
        }
    }


    // Obtenir le solde TRX d'une adresse
    async getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : BigInt> {
        try {
            const balance = await this.connection.trx.getBalance(address);

            if (!formatDecimals) {
                return BigInt(balance) as BigInt as T extends true ? never : BigInt;
            }

            return balance / 1e6 as T extends true ? number : never; // Convertir en TRX (6 décimales)

        } catch (error) {
            console.error("Error fetching TRX balance:", error);
            return 0 as T extends true ? number : never;
        }
    }


    async executeTransaction(to: string, value: string): Promise<string> {
        try {
            if (!this.signer) {
                throw new Error("Signer non initialisé. Impossible d'envoyer une transaction.");
            }

            // Convertir la valeur en Sun (1 TRX = 1e6 Sun)
            const amountInSun = this.connection.toSun(Number(value));

            // Construire la transaction
            const transaction = await this.connection.transactionBuilder.sendTrx(
                to, // Adresse du destinataire
                Number(amountInSun), // Montant en Sun
                this.signer // Adresse de l'expéditeur (dérivée de la clé privée)
            );

            // Signer la transaction
            const signedTransaction = await this.connection.trx.sign(transaction);

            // Envoyer la transaction sur le réseau Tron
            const broadcast = await this.connection.trx.sendRawTransaction(signedTransaction);

            if (broadcast.result) {
                console.log("Transaction envoyée. TX Hash:", broadcast.txid);
                return broadcast.txid; // Retourne l'ID de la transaction
            } else {
                throw new Error("La transaction n'a pas été acceptée par le réseau.");
            }

        } catch (error) {
            console.error("Erreur lors de l'exécution de la transaction sur Tron:", error);
            return "";
        }
    }


    // Vérifier le statut d'une transaction
    async getTransactionStatus(txHash: string): Promise<string> {
        try {
            const tx = await this.connection.trx.getTransaction(txHash);
            return tx.ret && tx.ret[0].contractRet === "SUCCESS" ? "Confirmed" : "Pending";

        } catch (error) {
            console.error("Error fetching transaction status:", error);
            return "Unknown";
        }
    }


    getWrappedToken() {
        return 'TT2Yb5hZgA1S3dEmKaSAgLxUz4JxcqmeAe'; // WTRX
    }


    getWrappedTokenUsdPair() {
        return 'TFGDbUyP8xez44C76fin3bn3Ss6jugoUwJ'; // TRON/USDT
    }


    // Obtenir la balance TRC-20 d'une adresse pour un token donné
    async getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : BigInt> {
        try {
            const contract = await this.connection.contract().at(tokenAddress);
            const decimals = await contract.decimals().call();
            const rawBalance = await contract.balanceOf(address).call();

            if (! formatDecimals) {
                return BigInt(rawBalance) as BigInt as T extends true ? never : BigInt;
            }

            return parseFloat(rawBalance) / Math.pow(10, decimals) as T extends true ? number : never;

        } catch (error) {
            console.error("Error fetching TRC-20 token balance:", error);
            return 0 as T extends true ? number : never;
        }
    }


    // Obtenir le prix d'un token (TRX ou TRC-20)
    async getTokenPrice(tokenAddress: string): Promise<number> {
        throw new Error('not available');
    }


    async getTokensPairPrice(pairAddress: string): Promise<number> {
        try {
            // Charger le contrat LP
            const lpContract = await this.connection.contract(LP_ABI, pairAddress);

            // Récupérer les adresses des tokens du pool
            const [token0Address, token1Address] = await Promise.all([
                lpContract.token0().call(),
                lpContract.token1().call(),
            ]);

            // Récupérer les décimales des tokens
            const erc20Abi = [
                {
                    inputs: [],
                    name: "decimals",
                    outputs: [{ name: "", type: "uint8" }],
                    stateMutability: "view",
                    type: "function",
                },
            ] as AbiFragment[];

            const token0Contract = await this.connection.contract(erc20Abi, token0Address);
            const token1Contract = await this.connection.contract(erc20Abi, token1Address);

            const [decimals0, decimals1] = await Promise.all([
                token0Contract.decimals().call(),
                token1Contract.decimals().call(),
            ]);

            // Récupérer les réserves
            const [reserve0, reserve1] = await lpContract.getReserves().call();

            // Ajuster les réserves avec les décimales
            const adjustedReserve0 = parseInt(reserve0._reserve0, 10) / Math.pow(10, decimals0);
            const adjustedReserve1 = parseInt(reserve1._reserve1, 10) / Math.pow(10, decimals1);

            // Calculer le prix
            return adjustedReserve1 / adjustedReserve0; // Prix de token1 en termes de token0

        } catch (error) {
            console.error("Error fetching token price on Tron:", error);
            return 0;
        }
    }


    async swapTokens(inputMint: string, outputMint: string, amount: number, slippage: number, swapMode: string): Promise<string> {
        return ''; // TODO
    }
}
