import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { JetPaths as Paths } from '@src/common/constants/Paths';
import FundRepo from '@src/repos/FundRepo';
import FundService, { ISupply } from '@src/services/FundService';

import { agent } from './support/agent';
import { TestRes } from './common/supertest-types';

/******************************************************************************
                               Constants
******************************************************************************/

// JTRSY's totalSupply on COTI testnet when these tests were written.
const JTRSY_SUPPLY = 198213115504n;

const { OK, NOT_FOUND, BAD_GATEWAY } = HttpStatusCodes;

/******************************************************************************
                                 Tests
  The chain read is stubbed at the repo, so these never touch COTI testnet.
******************************************************************************/

describe('FundRouter', () => {
  beforeEach(() => {
    FundService.clearCache();
    vi.restoreAllMocks();
  });

  describe(`"GET:${Paths.Funds.Supply()}"`, () => {
    it(
      'should return the fund\'s supply, raw and formatted, and a status code ' +
        `of "${OK}", serving a repeat request from the cache.`,
      async () => {
        const read = vi
          .spyOn(FundRepo, 'getTotalSupply')
          .mockResolvedValue(JTRSY_SUPPLY);

        const res: TestRes<{ supply: ISupply }> = await agent.get(
          Paths.Funds.Supply({ symbol: 'JTRSY' }),
        );
        expect(res.status).toBe(OK);
        expect(res.body.supply).toStrictEqual({
          symbol: 'JTRSY',
          token: '0x6D7cf587dbF68eb233B7BEd1f45BDfB6aE31Baf3',
          raw: '198213115504',
          decimals: 8,
          formatted: '1982.13115504',
        });

        await agent.get(Paths.Funds.Supply({ symbol: 'JTRSY' }));
        expect(read).toHaveBeenCalledTimes(1);
      },
    );

    it('should match the ticker case-insensitively.', async () => {
      vi.spyOn(FundRepo, 'getTotalSupply').mockResolvedValue(1n);
      const res: TestRes<{ supply: ISupply }> = await agent.get(
        Paths.Funds.Supply({ symbol: 'jaaa' }),
      );
      expect(res.status).toBe(OK);
      expect(res.body.supply.symbol).toBe('JAAA');
    });

    it(
      'should return a JSON object with the error message of ' +
        `"${FundService.Errors.FUND_NOT_FOUND}" and a status code of ` +
        `"${NOT_FOUND}" if the fund is unknown.`,
      async () => {
        const read = vi.spyOn(FundRepo, 'getTotalSupply');
        const res: TestRes = await agent.get(
          Paths.Funds.Supply({ symbol: 'NOPE' }),
        );
        expect(res.status).toBe(NOT_FOUND);
        expect(res.body.error).toBe(FundService.Errors.FUND_NOT_FOUND);
        expect(read).not.toHaveBeenCalled();
      },
    );

    it(
      'should return a JSON object with the error message of ' +
        `"${FundService.Errors.CHAIN_UNAVAILABLE}" and a status code of ` +
        `"${BAD_GATEWAY}" if the chain read fails, without caching the failure.`,
      async () => {
        vi.spyOn(FundRepo, 'getTotalSupply')
          .mockRejectedValueOnce(new Error('HTTP 502'))
          .mockResolvedValueOnce(JTRSY_SUPPLY);

        const failed: TestRes = await agent.get(
          Paths.Funds.Supply({ symbol: 'JTRSY' }),
        );
        expect(failed.status).toBe(BAD_GATEWAY);
        expect(failed.body.error).toBe(FundService.Errors.CHAIN_UNAVAILABLE);

        const retried: TestRes<{ supply: ISupply }> = await agent.get(
          Paths.Funds.Supply({ symbol: 'JTRSY' }),
        );
        expect(retried.status).toBe(OK);
        expect(retried.body.supply.raw).toBe('198213115504');
      },
    );
  });
});
