import { parseAbi } from 'viem';
import deployment from '../data/deployment.json';

export const DEPLOYMENT = deployment;

/**
 * Network switching and RPC are owned by the COTI wallet plugin, which ships its own
 * `cotiTestnet` chain definition — so this only needs the id and the explorer.
 */
export const COTI_TESTNET = {
  chainId: 7082400,
  name: 'COTI Testnet',
  explorer: 'https://testnet.cotiscan.io',
};

export type Pay = 'USDC' | 'USDT';

export const PAYMENT_TOKENS =
  DEPLOYMENT.paymentTokens as Record<Pay, { address: string; decimals: number; symbol: string }>;

/** Fund shares use 8 decimals and are stored as ctUint256. */
export const SHARE_DECIMALS = 8;
export const SHARE_BITS = 256;

export const PRIVATE_TOKEN_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function paused() view returns (bool)',
  'function identityRegistry() view returns (address)',
]);

export const SUBSCRIPTION_ABI = parseAbi([
  'function priceOf(address) view returns (uint256)',
  'function quote(address,uint256) view returns (uint256)',
  'function subscribe(address,uint256) returns (uint256)',
]);

export const REGISTRY_ABI = parseAbi([
  'function isVerified(address) view returns (bool)',
  'function setVerified(address,bool)',
]);

export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address,address) view returns (uint256)',
  'function approve(address,uint256) returns (bool)',
]);

export const explorerTx = (hash: string) => `${COTI_TESTNET.explorer}/tx/${hash}`;
export const explorerAddress = (a: string) => `${COTI_TESTNET.explorer}/address/${a}`;
