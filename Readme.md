# 🌍 web3-tools-multichains

## 🚀 Introduction

**web3-tools-multichains** est une bibliothèque TypeScript permettant d'interagir avec **plusieurs blockchains** en utilisant une **API unifiée**.  

Elle simplifie l'accès aux principales blockchains (Ethereum, Bitcoin, Solana, Tron, TON...) en proposant une interface commune pour :
- Gérer les wallets
- Envoyer des transactions
- Récupérer des soldes et prix de tokens
- Effectuer des swaps sur les DEX

## ⚠️ Statut
🚧 **Développement en cours - API non stable**  
Les fonctionnalités peuvent encore évoluer.

---

## 📖 Sommaire
- [🔥 Fonctionnalités](#-fonctionnalités)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
  - [1️⃣ Initialisation d'un provider](#1-initialisation-dun-provider)
  - [2️⃣ Récupération des soldes](#2-récupération-des-soldes-sur-différentes-blockchains)
  - [3️⃣ Envoi de transactions](#3-envoi-de-transactions)
  - [4️⃣ Swap de tokens](#-tokens-swap)
- [📜 Liste des imports disponibles](#available-imports)
- [📌 API - Méthodes BlockchainProvider](#methodes-blockchainprovider)
- [📢 Contribution & Support](#contribution--support)

---

## 🔥 Fonctionnalités

- ✅ **Support multi-blockchain** : Bitcoin, Ethereum, BSC, Polygon, Avalanche, Solana, TON, Tron...
- ✅ **Gestion simplifiée des wallets** (clé privée ou connexion externe)
- ✅ **Transactions et gestion des soldes**
- ✅ **Interactions avec les DEX et DeFi** (swap, prix des tokens...)
- ✅ **Support des RPCs personnalisés**

---

## 📦 Installation

```sh
npm install web3-tools-multichains
# OR
yarn add web3-tools-multichains
```



## Usage

### 1. Initialisation d'un provider

```ts
🌍 Ethereum / EVM Chains
import { getBlockchainProvider } from "web3-tools-multichains";

//const evmProvider = new EvmProvider("ethereum");

const evmProvider = getBlockchainProvider("ethereum", {
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    privateKey: "YOUR_PRIVATE_KEY"
});

const address = await evmProvider.getWalletAddress();
console.log("Mon adresse Ethereum:", address);
```


```ts
// 🔵 Solana

//const solanaProvider = new SolanaProvider("ethereum");

const solanaProvider = getBlockchainProvider("solana", {
    rpcUrl: "https://api.mainnet-beta.solana.com",
    privateKey: "YOUR_PRIVATE_KEY"
});

const solBalance = await solanaProvider.getBalance("ADDRESS_SOLANA");
console.log("Solana Balance:", solBalance);

```


```ts
// 💎 TON (The Open Network)
const tonProvider = getBlockchainProvider("ton", {
    rpcUrl: "https://toncenter.com/api/v2/jsonRPC",
    privateKey: "YOUR_PRIVATE_KEY"
});

const tonAddress = await tonProvider.getWalletAddress();
console.log("Adresse TON:", tonAddress);

```


```ts
// 🔴 Tron

const tronProvider = getBlockchainProvider("tron", {
    rpcUrl: "https://api.trongrid.io",
    privateKey: "YOUR_PRIVATE_KEY"
});

const tronBalance = await tronProvider.getBalance("ADDRESS_TRON");
console.log("Solde TRX:", tronBalance);
```


## 2. Récupération des soldes sur différentes blockchains

```ts
import { BitcoinBlockstreamProvider } from "web3-tools-multichains";

async function testBitcoin() {
    const provider = new BitcoinBlockstreamProvider();
    const coinBalance = await provider.getBalance("ADDRESS_BTC");
    console.log(`BTC Balance: ${coinBalance} BTC`);
}
testBitcoin();

```

```ts
import { SolanaProvider } from "web3-tools-multichains";

async function testSolana() {
    const provider = new SolanaProvider();

    const solBalance = await provider.getBalance(walletAddress);
    console.log(`SOL Balance: ${solBalance} SOL`);

    const tokenAddress = "Cq16t8jRSxtQDcPyANothLYemBDkN6SVKjqSDZ99pump"; // WLFI
    const tokenBalance = await provider.getTokenBalance("ADDRESS_SOL", tokenAddress);
    console.log(`Token Balance: ${tokenBalance}`);
}
testSolana();

```

```ts
async function testEthereum() {
    const provider = new EvmProvider("ethereum");

    const ethBalance = await provider.getBalance("ADDRESS_ETH");
    console.log(`ETH Balance: ${ethBalance} ETH`);

    const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
    const tokenBalance = await provider.getTokenBalance("ADDRESS_ETH", tokenAddress);
    console.log(`Token Balance: ${tokenBalance}`);
}
testEthereum();

```


```ts
async function testBsc() {
    const provider = new EvmProvider("bsc");

    const bnbBalance = await provider.getBalance("ADDRESS_BNB");
    console.log(`BNB Balance: ${bnbBalance} BNB`);

    const tokenAddress = "0x8965349fb649A33a30cbFDa057D8eC2C48AbE2A2"; // anyUSDC
    const tokenBalance = await provider.getTokenBalance("ADDRESS_BNB", tokenAddress);
    console.log(`Token Balance: ${tokenBalance}`);
}
testBsc();


```


```ts
async function testFantom() {
    const provider = new EvmProvider("fantom");

    const ftmBalance = await provider.getBalance("ADDRESS_FTM");
    console.log(`FTM Balance: ${ftmBalance} FTM`);

    const tokenAddress = "0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37"; // TSHARE
    const tokenBalance = await provider.getTokenBalance("ADDRESS_FTM", tokenAddress);
    console.log(`Token Balance: ${tokenBalance}`);
}
testFantom();
```


```ts
async function testAvalanche() {
    const provider = new EvmProvider("avalanche");

    const avaxBalance = await provider.getBalance("ADDRESS_AVAX");
    console.log(`AVAX Balance: ${avaxBalance} AVAX`);

    const tokenAddress = "0x42571ca6E3994629061de9e645bB722d9131c4a6"; // EGGS
    const tokenBalance = await provider.getTokenBalance("ADDRESS_AVAX", tokenAddress);
    console.log(`Token Balance: ${tokenBalance}`);
}
testAvalanche();
```



```ts
async function testPolygon() {
    const provider = new EvmProvider("polygon");

    const polBalance = await provider.getBalance("ADDRESS_POL");
    console.log(`POL Balance: ${polBalance} POL`);

    const tokenAddress = "0xD6DF932A45C0f255f85145f286eA0b292B21C90B"; // AAVE
    const tokenBalance = await provider.getTokenBalance("ADDRESS_POL", tokenAddress);
    console.log(`Token Balance: ${tokenBalance}`);
}
testPolygon();
```


```ts
async function testTon() {
    const provider = new TonProvider();

    const tonBalance = await provider.getBalance("ADDRESS_TON");
    console.log(`TON Balance: ${tonBalance} TON`);
}
testTon();
```


```ts
async function testTron() {
    const provider = new TronProvider();

    const trxBalance = await provider.getBalance("ADDRESS_TRON");
    console.log(`TRX Balance: ${trxBalance} TRX`);
}
testTron();
```




## 3. Envoi de transactions


```ts
// Envoyer des tokens natifs (ETH, SOL, TRX, TON...)

const txHash = await evmProvider.executeTransaction("DESTINATION_ADDRESS", "0.1"); 
console.log("Transaction envoyée, hash:", txHash);

```


```ts
// Vérifier le statut d'une transaction

const status = await evmProvider.getTransactionStatus(txHash);
console.log("Statut de la transaction:", status);

```


## 🔥 Tokens Swap

### Swap sur Solana (Jupiter Swap)
```ts
// Acheter un token en payant en SOL
import { SolanaProvider } from "web3-tools-multichains";
import * as solanaJupiter from "web3-tools-multichains/blockchains/solana/jupiter";

async function swapSOLToToken(pairAddress: string) {
    const provider = new SolanaProvider(undefined, 'YOUR_PRIVATE_KEY');
    const tokens = await solanaJupiter.getLpTokenMints(provider.getConnection(), pairAddress);

    const walletAddress = await provider.getWalletAddress();
    const inputMint = tokens.quoteToken; // SOL (Token utilisé pour payer)
    const outputMint = tokens.baseToken; // Token à acheter

    if (inputMint !== 'So11111111111111111111111111111111111111112') {
        throw new Error(`unexpected inputMint ${inputMint}`);
    }

    const inputBalance = await provider.getBalance(walletAddress, false);
    console.log('Input Balance (SOL):', inputBalance);

    const inputAmount = BigInt(0.1 * 1e9); // 0.1 SOL
    console.log('Input Amount:', inputAmount);

    if (inputAmount >= inputBalance - BigInt(0.1 * 1e9)) {
        throw new Error(`Insufficient input balance`);
    }

    await provider.swapTokens(inputMint, outputMint, inputAmount, 5);
    console.log('Swap completed!');
}

swapSOLToToken("PAIR_ADDRESS_HERE");



// Vendre un token contre du SOL
async function swapTokenToSOL(pairAddress: string) {
    const provider = new SolanaProvider(undefined, 'YOUR_PRIVATE_KEY');
    const tokens = await solanaJupiter.getLpTokenMints(provider.getConnection(), pairAddress);

    const walletAddress = await provider.getWalletAddress();
    const inputMint = tokens.baseToken; // Token à vendre
    const outputMint = tokens.quoteToken; // SOL reçu

    if (outputMint !== 'So11111111111111111111111111111111111111112') {
        throw new Error(`unexpected outputMint ${outputMint}`);
    }

    const inputBalance = await provider.getTokenBalance(walletAddress, inputMint, false);
    console.log('Input Balance:', inputBalance);

    const inputAmount = inputBalance;
    console.log('Selling Amount:', inputAmount);

    await provider.swapTokens(inputMint, outputMint, inputAmount, 5);
    console.log('Swap completed!');
}

swapTokenToSOL("PAIR_ADDRESS_HERE");

```

### Swap sur Ethereum & EVM (Uniswap v2/v3)

```ts
// Acheter un token en payant en ETH (WETH pair)

import { EvmProvider } from "web3-tools-multichains";

async function swapETHToToken() {
    const provider = new EvmProvider("ethereum", undefined, 'YOUR_PRIVATE_KEY');
    const walletAddress = await provider.getWalletAddress();

    const inputMint = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH (ETH Wrapped)
    const outputMint = "0xA0b86991c6218b36c1d19d4a2e9eb0cE3606eB48"; // USDC

    const inputBalance = await provider.getBalance(walletAddress, false);
    console.log('ETH Balance:', inputBalance);

    const inputAmount = BigInt(0.05 * 1e18); // 0.05 ETH
    console.log('Input Amount:', inputAmount);

    await provider.swapTokens(inputMint, outputMint, inputAmount, 5, "uniswap");
    console.log('Swap completed on Uniswap!');
}

swapETHToToken();



// Vendre un token contre de l'ETH

async function swapTokenToETH() {
    const provider = new EvmProvider("ethereum", undefined, 'YOUR_PRIVATE_KEY');
    const walletAddress = await provider.getWalletAddress();

    const inputMint = "0xA0b86991c6218b36c1d19d4a2e9eb0cE3606eB48"; // USDC
    const outputMint = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH (ETH Wrapped)

    const inputBalance = await provider.getTokenBalance(walletAddress, inputMint, false);
    console.log('USDC Balance:', inputBalance);

    const inputAmount = BigInt(inputBalance);
    console.log('Selling Amount:', inputAmount);

    await provider.swapTokens(inputMint, outputMint, inputAmount, 5, "uniswap");
    console.log('Swap completed on Uniswap!');
}

swapTokenToETH();
```



## Available imports

```ts
export { rpcDefault } from './rpc.default';

export { BlockchainProvider, getBlockchainProvider, ChainName, BlockchainProviderOptions } from './blockchains/BlockchainProvider';

export { EvmProvider, EvmChainName } from './blockchains/EvmProvider';

export { BitcoinCoreProvider as BitcoinCoreProvider } from './blockchains/BitcoinProvider.bitcoin-core';
export { BitcoinBlockstreamProvider as BitcoinBlockstreamProvider } from './blockchains/BitcoinProvider.blockstream';

export { SolanaProvider } from './blockchains/SolanaProvider';
export * as solana from './blockchains/solana/solana';
export * as solanaTransaction from './blockchains/solana/transaction.utils';
export * as solanaJupiter from './blockchains/solana/jupiter';
export * as solanaPumpfun from './blockchains/solana/pumpfun';
export * as solanaRaydium from './blockchains/solana/raydium';

export { TonProvider } from './blockchains/TonProvider';

export { TronProvider } from './blockchains/TronProvider';

export { CoinPriceProvider } from './tools/market/CoinPriceProvider';
export { TokenPriceProvider } from './tools/defi/TokenPriceProvider';
```


## Methodes BlockchainProvider

```ts
export interface BlockchainProvider {
    getConnection(): any;

    // Wallets/Accounts
    //formatPrice(decimals?: number): string;
    getWallet(): Promise<any | null>;
    getWalletAddress(): Promise<string>;
    getBalance<T extends boolean>(address: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;

    // Transactions
    executeTransaction(to: string, value: string, data?: string): Promise<string>;
    getTransactionStatus(txHash: string): Promise<string>;

    // Defi
    getWrappedToken(): string;
    getWrappedTokenUsdPair(): string;
    getTokenBalance<T extends boolean>(address: string, tokenAddress: string, formatDecimals?: T): Promise<T extends true ? number : bigint>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    getTokensPairPrice(pairAddress: string): Promise<number>;
    swapTokens(inputMint: string, outputMint: string, amount: bigint, slippage?: number, swapMode?: string): Promise<string>
}
```

