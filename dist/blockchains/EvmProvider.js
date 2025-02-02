"use strict";
// EvmProvider.ts
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
exports.EvmProvider = void 0;
const ethers_1 = require("ethers");
const rpc_default_1 = require("../rpc.default");
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
    'ethereum': rpc_default_1.rpcDefault.ethereum.publicnode,
    'bsc': rpc_default_1.rpcDefault.bsc.publicnode,
    'fantom': rpc_default_1.rpcDefault.fantom.publicnode,
    'polygon': rpc_default_1.rpcDefault.polygon.publicnode,
    'avalanche': rpc_default_1.rpcDefault.avalanche.publicnode,
    'base': rpc_default_1.rpcDefault.base.publicnode,
    'arbitrum': rpc_default_1.rpcDefault.arbitrum.publicnode,
    'optimism': rpc_default_1.rpcDefault.optimism.publicnode,
};
const dexesRouters = {
    'ethereum': '', // uniswap
    'bsc': '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap: Router v2
    'fantom': '', // spookyswap
    'polygon': '', // quickswap
    'avalanche': '', // traderjoe
    'base': '', // aerodrome
};
const dexesFactories = {
    'ethereum': '', // uniswap
    'bsc': '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // PancakeSwap: Factory v2
    'fantom': '', // spookyswap
    'polygon': '', // quickswap
    'avalanche': '', // traderjoe
    'base': '', // aerodrome OR uniswap
    'arbitrum': '', // uniswap OR camelot
    'optimism': '', // velodrome OR uniswap
};
const wrappedCoins = {
    'ethereum': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    'bsc': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    'fantom': '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // WFTM
    'polygon': '0x95999f8580b6fb0293c86c055dd49bcfbf0c5c45', // WPOL
    'avalanche': '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
    'base': '0x4200000000000000000000000000000000000006', // WETH
    'arbitrum': '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
    'optimism': '0x4200000000000000000000000000000000000006', // WETH
};
const wrappedCoinsUsdPair = {
    'ethereum': '', // WETH
    'bsc': '0xd99c7f6c65857ac913a8f880a4cb84032ab2fc5b', // WBNB/USDC
    'fantom': '0x68FD6F4dBEe83C0A2259Cb291d1409d140033e6f', // USDC.e/WFTM
    'polygon': '0xB6e57ed85c4c9dbfEF2a68711e9d6f36c56e0FcB', // USDC/WPOL
    'avalanche': '0xfAe3f424a0a47706811521E3ee268f00cFb5c45E', // WAVAX/USDC
    'base': '', // WETH
    'arbitrum': '', // WETH
    'optimism': '', // WETH
};
class EvmProvider {
    constructor(chainName, rpcUrl, privateKey) {
        this.chainName = chainName;
        rpcUrl = rpcUrl || rpcUrls[chainName];
        if (!rpcUrl) {
            throw new Error(`No RPC Url for chain ${chainName}`);
        }
        this.connection = new ethers_1.JsonRpcProvider(rpcUrl);
        this.signer = privateKey ? new ethers_1.Wallet(privateKey, this.connection) : null;
    }
    getConnection() {
        return this.connection;
    }
    getWalletAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = this.signer) === null || _a === void 0 ? void 0 : _a.address) || '';
        });
    }
    getWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.signer;
        });
    }
    getBalance(address, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.connection.getBalance(address);
            if (!formatDecimals) {
                return BigInt(balance);
            }
            return parseFloat((0, ethers_1.formatEther)(balance)); // Conversion en ETH
        });
    }
    executeTransaction(to_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (to, value, data = "0x") {
            if (!this.signer) {
                throw new Error(`missing signer`);
            }
            try {
                const tx = yield this.signer.sendTransaction({
                    to,
                    value: (0, ethers_1.parseEther)(value), // Value in ETH
                    data, // Optional calldata for contracts
                    gasLimit: 21000, // Adjust for contract calls if needed
                });
                console.log(`Transaction sent: ${tx.hash}`);
                yield tx.wait(); // Wait for transaction confirmation
                console.log(`Transaction confirmed: ${tx.hash}`);
                return tx.hash;
            }
            catch (error) {
                console.error("Error executing transaction on EVM:", error);
                throw error;
            }
        });
    }
    getTransactionStatus(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this.connection.getTransactionReceipt(txHash);
            return (receipt === null || receipt === void 0 ? void 0 : receipt.status) === 1 ? "Success" : "Fail";
        });
    }
    getWrappedToken() {
        const tokenAddress = wrappedCoins[this.chainName];
        return tokenAddress;
    }
    getWrappedTokenUsdPair() {
        const pairAddress = wrappedCoinsUsdPair[this.chainName];
        return pairAddress;
    }
    getTokenBalance(address, tokenAddress, formatDecimals) {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = new ethers_1.Contract(tokenAddress, erc20Abi, this.connection);
            const [rawBalance, decimals] = yield Promise.all([
                contract.balanceOf(address),
                contract.decimals(),
            ]);
            if (!formatDecimals) {
                return BigInt(rawBalance);
            }
            // Convertir en unité lisible
            return parseFloat((0, ethers_1.formatUnits)(rawBalance, decimals));
        });
    }
    getTokenPrice(tokenAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('not available');
        });
    }
    getTokensPairPrice(pairAddress_1) {
        return __awaiter(this, arguments, void 0, function* (pairAddress, inverseAssets = false) {
            // Exemple avec un pool Uniswap V2
            const lpContract = new ethers_1.Contract(pairAddress, LP_ABI, this.connection);
            // Récupérer les adresses des deux tokens dans le pool
            const [token0Address, token1Address] = yield Promise.all([
                lpContract.token0(),
                lpContract.token1(),
            ]);
            const token0Contract = new ethers_1.Contract(token0Address, erc20Abi, this.connection);
            const token1Contract = new ethers_1.Contract(token1Address, erc20Abi, this.connection);
            // Récupérer les décimales des deux tokens
            const [decimals0, decimals1] = yield Promise.all([
                token0Contract.decimals(),
                token1Contract.decimals(),
            ]);
            const [reserve0, reserve1] = yield lpContract.getReserves();
            // Suppose que token0 est `currency` et token1 est `tokenAddress`
            const adjustedReserve0 = parseFloat((0, ethers_1.formatUnits)(reserve0, decimals0));
            const adjustedReserve1 = parseFloat((0, ethers_1.formatUnits)(reserve1, decimals1));
            return inverseAssets
                ? adjustedReserve0 / adjustedReserve1
                : adjustedReserve1 / adjustedReserve0;
        });
    }
    swapTokens(buyToken, sellToken, amountIn, slippage, swapMode) {
        return __awaiter(this, void 0, void 0, function* () {
            const routerAddress = dexesRouters[this.chainName];
            if (!routerAddress) {
                throw new Error(`no router found for swap`);
            }
            const provider = this.connection;
            const account = yield provider.getSigner();
            const routerContract = new ethers_1.Contract(routerAddress, [
                'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
                'function swapExactTokensForTokens( uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)',
            ], account);
            //const amountIn = parseUnits('0.1', 'ether'); //ether is the measurement, not the coin
            const amounts = yield routerContract.getAmountsOut(amountIn, [buyToken, sellToken]);
            const amountOutMin = amounts[1].sub(amounts[1].div(10)); // math for Big numbers in JS
            //        console.log(`
            //~~~~~~~~~~~~~~~~~~~~
            //Buying new token
            //~~~~~~~~~~~~~~~~~~~~
            //buyToken: ${amountIn.toString()} ${buyToken} (WBNB)
            //sellToken: ${amountOutMin.toString()} ${sellToken}
            //`);
            const tx = yield routerContract.swapExactTokensForTokens(amountIn, amountOutMin, [buyToken, sellToken], account.address, Date.now() + 1000 * 60 * 5 // 5 minutes
            );
            const receipt = yield tx.wait();
            console.log('Transaction receipt');
            console.log(receipt);
            return receipt.transactionHash;
        });
    }
}
exports.EvmProvider = EvmProvider;
//# sourceMappingURL=EvmProvider.js.map