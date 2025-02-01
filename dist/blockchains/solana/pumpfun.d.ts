import WebSocket from "ws";
import { Connection } from "@solana/web3.js";
export type Payload = {
    method: string;
    keys?: string[];
};
export type SubscribeResult = {
    message: string;
};
export type UnsubscribeResult = {
    message: string;
};
export type CreateTokenResult = {
    signature: string;
    mint: string;
    traderPublicKey: string;
    txType: 'create';
    initialBuy: number;
    solAmount: number;
    bondingCurveKey: string;
    vTokensInBondingCurve: number;
    vSolInBondingCurve: number;
    marketCapSol: number;
    name: string;
    symbol: string;
    uri: string;
    pool: string;
};
export type TokenTradeResult = {
    signature: string;
    mint: string;
    traderPublicKey: string;
    txType: 'sell' | 'buy';
    tokenAmount: number;
    solAmount: number;
    newTokenBalance: number;
    bondingCurveKey: string;
    vTokensInBondingCurve: number;
    vSolInBondingCurve: number;
    marketCapSol: number;
    pool: string;
};
export type CreateWalletResult = {
    apiKey: string;
    walletPublicKey: string;
    privateKey: string;
};
export type RaydiumLiquidityResult = {
    signature: string;
    mint: string;
    txType: 'addLiquidity';
    marketId: string;
    marketCapSol: number;
    price: number;
    pool: string;
};
export type CreateTokenOptions = {
    name: string;
    imageFile?: string;
    symbol: string;
    description: string;
    twitter?: string;
    telegram?: string;
    website?: string;
    solAmount: number;
};
export type SendPortalTransactionOptions = {
    tokenAddress: string;
    orderType: 'buy' | 'sell';
    amount: BigInt;
    priorityFee?: number;
    slippage?: number;
};
export declare function getPumpPortalWebsocket(): WebSocket;
export declare function subscribeNewToken(ws: WebSocket): void;
export declare function unsubscribeNewToken(ws: WebSocket): void;
export declare function subscribeAccountTrade(ws: WebSocket, keys: string[]): void;
export declare function unsubscribeAccountTrade(ws: WebSocket, keys: string[]): void;
export declare function subscribeTokenTrade(ws: WebSocket, keys: string[]): void;
export declare function unsubscribeTokenTrade(ws: WebSocket, keys: string[]): void;
export declare function subscribeRaydiumLiquidity(ws: WebSocket): void;
export declare function unsubscribeRaydiumLiquidity(ws: WebSocket): void;
export declare function createWallet(): Promise<CreateWalletResult>;
export declare function createToken(connection: Connection, privateKey: string, walletAddress: string, options: CreateTokenOptions): Promise<void>;
export declare function sendPumpTransaction(connection: Connection, privateKey: string, walletAddress: string, options: SendPortalTransactionOptions): Promise<void>;
