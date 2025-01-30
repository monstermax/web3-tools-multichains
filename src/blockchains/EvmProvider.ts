// EvmProvider.ts

import { JsonRpcProvider, formatEther, formatUnits, parseEther, Contract, Wallet } from "ethers";

import { BlockchainProvider } from "./BlockchainProvider";


type EvmChainName = keyof typeof rpcUrls;

const LP_ABI = [
    {
      constant: true,
      inputs: [],
      name: "getReserves",
      outputs: [
        { name: "_reserve0", type: "uint112" },
        { name: "_reserve1", type: "uint112" },
        { name: "_blockTimestampLast", type: "uint32" },
      ],
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "token0",
      outputs: [{ name: "", type: "address" }],
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "token1",
      outputs: [{ name: "", type: "address" }],
      type: "function",
    },
];


const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
];

const rpcUrls = {
    'ethereum': "https://rpc.ankr.com/eth",
    'bsc': "https://bsc-dataseed1.binance.org/",
    'fantom': "https://rpcapi.fantom.network",
    'polygon': "https://polygon-rpc.com/",
    'avalanche': "https://api.avax.network/ext/bc/C/rpc",
};

const dexes: {[chainName: string]: string} = {
    'ethereum': 'uniswap',
    'bsc': 'pancakeswap',
    'fantom': 'spookyswap',
    'polygon': 'quickswap',
    'avalanche': 'traderjoe',
}


export class EvmProvider implements BlockchainProvider {
    private connection: JsonRpcProvider;
    private signer: Wallet | null;
    private chainName: string;

    constructor(chainName: EvmChainName, rpcUrl?: string, privateKey=null) {
        this.chainName = chainName;

        rpcUrl = rpcUrl || rpcUrls[chainName];

        if (! rpcUrl) {
            throw new Error(`No RPC Url for chain ${chainName}`);
        }

        this.connection = new JsonRpcProvider(rpcUrl);

        this.signer = privateKey ? new Wallet(privateKey, this.connection) : null;
    }


    getConnection() {
        return this.connection;
    }


    async getWalletAddress(): Promise<string> {
        return this.signer?.address || '';
    }


    async getBalance(address: string, formatDecimals=true): Promise<number> {
        const balance = await this.connection.getBalance(address);

        if (! formatDecimals) {
            return Number(balance);
        }

        return parseFloat(formatEther(balance)); // Conversion en ETH
    }


    async executeTransaction(to: string, value: string, data: string = "0x"): Promise<string> {
        if (! this.signer) {
            throw new Error(`missing signer`);
        }

        try {
            const tx = await this.signer.sendTransaction({
                to,
                value: parseEther(value), // Value in ETH
                data, // Optional calldata for contracts
                gasLimit: 21000, // Adjust for contract calls if needed
            });

            console.log(`Transaction sent: ${tx.hash}`);
            await tx.wait(); // Wait for transaction confirmation

            console.log(`Transaction confirmed: ${tx.hash}`);
            return tx.hash;

        } catch (error) {
            console.error("Error executing transaction on EVM:", error);
            throw error;
        }
    }


    async getTransactionStatus(txHash: string): Promise<string> {
        const receipt = await this.connection.getTransactionReceipt(txHash);
        return receipt?.status === 1 ? "Success" : "Fail";
    }


    async getTokenBalance(address: string, tokenAddress: string, formatDecimals=true): Promise<number> {
        const contract = new Contract(tokenAddress, erc20Abi, this.connection);

        const [rawBalance, decimals] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals(),
        ]);

        // Convertir en unité lisible
        return parseFloat(formatUnits(rawBalance, decimals));
    }


    async getTokenPrice(pairAddress: string, inverseAssets=false): Promise<number> {
        // Exemple avec un pool Uniswap V2
        const lpContract = new Contract(pairAddress, LP_ABI, this.connection);

        // Récupérer les adresses des deux tokens dans le pool
        const [token0Address, token1Address] = await Promise.all([
            lpContract.token0(),
            lpContract.token1(),
        ]);

        const token0Contract = new Contract(token0Address, erc20Abi, this.connection);
        const token1Contract = new Contract(token1Address, erc20Abi, this.connection);

        // Récupérer les décimales des deux tokens
        const [decimals0, decimals1] = await Promise.all([
            token0Contract.decimals(),
            token1Contract.decimals(),
        ]);

        const [reserve0, reserve1] = await lpContract.getReserves();

        // Suppose que token0 est `currency` et token1 est `tokenAddress`
        const adjustedReserve0 = parseFloat(formatUnits(reserve0, decimals0));
        const adjustedReserve1 = parseFloat(formatUnits(reserve1, decimals1));

        return inverseAssets
            ? adjustedReserve0 / adjustedReserve1
            : adjustedReserve1 / adjustedReserve0;
    }


    async swapTokens(inputMint: string, outputMint: string, amount: number, slippage: number, swapMode: string): Promise<string> {
        const dex = dexes[this.chainName]
        return ''; // TODO: uniswap + pancakeswap + quickswap + spookyswap + traderjoe
    }
}
