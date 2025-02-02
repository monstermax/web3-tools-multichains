// EvmProvider.ts

import { JsonRpcProvider, formatEther, formatUnits, parseEther, Contract, Wallet, parseUnits } from "ethers";

import { BlockchainProvider } from "./BlockchainProvider";
import { rpcDefault } from "../rpc.default";


export type EvmChainName = keyof typeof rpcUrls;


// https://docs.uniswap.org/contracts/v2/reference/smart-contracts/pair
const LP_ABI = [
    {
        constant: true,
        inputs: [],
        name: "getReserves",
        outputs: [
            { name: "reserve0", type: "uint112" },
            { name: "reserve1", type: "uint112" },
            { name: "blockTimestampLast", type: "uint32" },
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
    'ethereum': rpcDefault.ethereum.publicnode,
    'bsc': rpcDefault.bsc.publicnode,
    'fantom': rpcDefault.fantom.publicnode,
    'polygon': rpcDefault.polygon.publicnode,
    'avalanche': rpcDefault.avalanche.publicnode,
    'base': rpcDefault.base.publicnode,
    'arbitrum': rpcDefault.arbitrum.publicnode,
    'optimism': rpcDefault.optimism.publicnode,
};


const dexesRouters: { [chainName: string]: string } = {
    'ethereum': '', // uniswap
    'bsc': '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap: Router v2
    'fantom': '', // spookyswap
    'polygon': '', // quickswap
    'avalanche': '', // traderjoe
    'base': '', // aerodrome
}


const dexesFactories: { [chainName: string]: string } = {
    'ethereum': '', // uniswap
    'bsc': '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap: Factory v2
    'fantom': '', // spookyswap
    'polygon': '', // quickswap
    'avalanche': '', // traderjoe
    'base': '', // aerodrome OR uniswap
    'arbitrum': '', // uniswap OR camelot
    'optimism': '', // velodrome OR uniswap
}


const wrappedCoins: { [chainName: string]: string } = {
    'ethereum': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    'bsc': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    'fantom': '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // WFTM
    'polygon': '0x95999f8580b6fb0293c86c055dd49bcfbf0c5c45', // WPOL
    'avalanche': '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    'base': '0x4200000000000000000000000000000000000006', // WETH
    'arbitrum': '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
    'optimism': '0x4200000000000000000000000000000000000006', // WETH
}

const wrappedCoinsUsdPair: { [chainName: string]: string } = {
    'ethereum': '', // WETH
    'bsc': '0xd99c7f6c65857ac913a8f880a4cb84032ab2fc5b', // WBNB/USDC
    'fantom': '0x68FD6F4dBEe83C0A2259Cb291d1409d140033e6f', // USDC.e/WFTM
    'polygon': '0xB6e57ed85c4c9dbfEF2a68711e9d6f36c56e0FcB', // USDC/WPOL
    'avalanche': '0xfAe3f424a0a47706811521E3ee268f00cFb5c45E', // WAVAX/USDC
    'base': '', // WETH
    'arbitrum': '', // WETH
    'optimism': '', // WETH
}


export class EvmProvider implements BlockchainProvider {
    private connection: JsonRpcProvider;
    private signer: Wallet | null;
    private chainName: string;

    constructor(chainName: EvmChainName, rpcUrl?: string, privateKey?: string) {
        this.chainName = chainName;

        rpcUrl = rpcUrl || rpcUrls[chainName];

        if (!rpcUrl) {
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


    async getWallet(): Promise<Wallet | null> {
        return this.signer;
    }


    async getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : bigint> {
        const balance = await this.connection.getBalance(address);

        if (!formatDecimals) {
            return BigInt(balance) as bigint as T extends true ? never : bigint;
        }

        return parseFloat(formatEther(balance)) as T extends true ? number : never; // Conversion en ETH
    }


    async executeTransaction(to: string, value: string, data: string = "0x"): Promise<string> {
        if (!this.signer) {
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


    getWrappedToken() {
        const tokenAddress = wrappedCoins[this.chainName];
        return tokenAddress;
    }


    getWrappedTokenUsdPair() {
        const pairAddress = wrappedCoinsUsdPair[this.chainName];
        return pairAddress;
    }


    async getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : bigint> {
        const contract = new Contract(tokenAddress, erc20Abi, this.connection);

        const [rawBalance, decimals] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals(),
        ]);

        if (!formatDecimals) {
            return BigInt(rawBalance) as bigint as T extends true ? never : bigint;
        }

        // Convertir en unité lisible
        return parseFloat(formatUnits(rawBalance, decimals)) as T extends true ? number : never;
    }



    async getTokenPrice(tokenAddress: string): Promise<number> {
        throw new Error('not available');
    }


    async getTokensPairPrice(pairAddress: string, inverseAssets=false): Promise<number> {
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


    async swapTokens(buyToken: string, sellToken: string, amountIn: bigint, slippage: number, swapMode: string): Promise<string> {
        const routerAddress = dexesRouters[this.chainName];

        if (!routerAddress) {
            throw new Error(`no router found for swap`);
        }

        const provider = this.connection;
        const account = await provider.getSigner();

        const routerContract = new Contract(
            routerAddress,
            [
                'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
                'function swapExactTokensForTokens( uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)',
            ],
            account
        );

        //const amountIn = parseUnits('0.1', 'ether'); //ether is the measurement, not the coin
        const amounts = await routerContract.getAmountsOut(amountIn, [buyToken, sellToken]);

        const amountOutMin = amounts[1].sub(amounts[1].div(10)); // math for Big numbers in JS

        //        console.log(`
        //~~~~~~~~~~~~~~~~~~~~
        //Buying new token
        //~~~~~~~~~~~~~~~~~~~~
        //buyToken: ${amountIn.toString()} ${buyToken} (WBNB)
        //sellToken: ${amountOutMin.toString()} ${sellToken}
        //`);

        const tx = await routerContract.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            [buyToken, sellToken],
            account.address,
            Date.now() + 1000 * 60 * 5 // 5 minutes
        );
        const receipt = await tx.wait();

        console.log('Transaction receipt');
        console.log(receipt);

        return receipt.transactionHash;
    }
}
