import { formatUnits } from 'viem';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import FundRepo from '@src/repos/FundRepo';

/******************************************************************************
                                Constants
******************************************************************************/

const Errors = {
  FUND_NOT_FOUND: 'Fund not found',
  CHAIN_UNAVAILABLE: 'Could not read from COTI testnet',
} as const;

// Blocks land every ~5s; a short cache keeps most requests off the flaky RPC.
const SUPPLY_TTL_MS = 10_000;

/******************************************************************************
                                Types
******************************************************************************/

export interface ISupply {
  symbol: string;
  token: string;
  raw: string;
  decimals: number;
  formatted: string;
}

/******************************************************************************
                                Variables
******************************************************************************/

const supplyCache = new Map<string, { at: number; value: Promise<bigint> }>();

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Total shares issued for one fund, read from its token's totalSupply.
 */
async function getSupply(symbol: string): Promise<ISupply> {
  const fund = FundRepo.find(symbol);
  if (!fund) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.FUND_NOT_FOUND);
  }

  // Caching the promise also means concurrent requests share one RPC call.
  let hit = supplyCache.get(fund.symbol);
  if (!hit || Date.now() - hit.at > SUPPLY_TTL_MS) {
    hit = { at: Date.now(), value: FundRepo.getTotalSupply(fund) };
    supplyCache.set(fund.symbol, hit);
  }

  let raw: bigint;
  try {
    raw = await hit.value;
  } catch {
    // Never cache a failure, but don't evict a newer entry either.
    if (supplyCache.get(fund.symbol) === hit) {
      supplyCache.delete(fund.symbol);
    }
    throw new RouteError(HttpStatusCodes.BAD_GATEWAY, Errors.CHAIN_UNAVAILABLE);
  }

  // bigint doesn't survive JSON.stringify, so the raw value goes out as a string.
  return {
    symbol: fund.symbol,
    token: fund.token,
    raw: raw.toString(),
    decimals: fund.decimals,
    formatted: formatUnits(raw, fund.decimals),
  };
}

/**
 * Drop every cached supply, so the next read goes to the chain.
 */
function clearCache(): void {
  supplyCache.clear();
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  Errors,
  getSupply,
  clearCache,
} as const;
