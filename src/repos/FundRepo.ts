import { type Address } from 'viem';

import { DEPLOYMENT, PRIVATE_TOKEN_ABI } from '@src/vendor/rwa/lib/contracts';

import { coti } from './common/coti';

/******************************************************************************
                                Types
******************************************************************************/

export type IFund = (typeof DEPLOYMENT.funds)[keyof typeof DEPLOYMENT.funds];

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Look a fund up by ticker, case-insensitive.
 */
function find(symbol: string): IFund | null {
  const funds: Record<string, IFund> = DEPLOYMENT.funds;
  return funds[symbol.toUpperCase()] ?? null;
}

/**
 * The fund token's public totalSupply, in base units.
 */
function getTotalSupply(fund: IFund): Promise<bigint> {
  return coti.readContract({
    address: fund.token as Address,
    abi: PRIVATE_TOKEN_ABI,
    functionName: 'totalSupply',
  });
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  find,
  getTotalSupply,
} as const;
