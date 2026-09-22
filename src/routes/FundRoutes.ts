import { isString } from 'jet-validators';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import FundService from '@src/services/FundService';

import { Req, Res } from './common/express-types';
import parseReq from './common/parseReq';

/******************************************************************************
                                Constants
******************************************************************************/

const reqValidators = {
  supply: parseReq({ symbol: isString }),
} as const;

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Total shares issued for one fund.
 *
 * @route GET /api/funds/:symbol/supply
 */
async function getSupply(req: Req, res: Res) {
  const { symbol } = reqValidators.supply(req.params);
  const supply = await FundService.getSupply(symbol);
  res.status(HttpStatusCodes.OK).json({ supply });
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getSupply,
} as const;
