/**
 * Refresh src/vendor/rwa from github.com/plucena/rwa, the source of truth for the fund
 * contracts' ABIs and addresses. The copies are committed so the API builds on its own,
 * and they are kept byte-for-byte identical to upstream so drift is a plain comparison.
 *
 *   npm run sync:contracts     overwrite the vendored copies with upstream
 *   npm run check:contracts    exit 1 if a vendored copy differs from upstream
 */
import fs from 'fs/promises';
import logger from 'jet-logger';
import path from 'path';

/******************************************************************************
                                Constants
******************************************************************************/

const UPSTREAM = 'https://raw.githubusercontent.com/plucena/rwa/main/app/src';
const VENDOR_DIR = path.join(__dirname, '../src/vendor/rwa');

// contracts.ts imports '../data/deployment.json', so both keep their relative layout.
const FILES = ['lib/contracts.ts', 'data/deployment.json'] as const;

/******************************************************************************
                                  Run
******************************************************************************/

async function main() {
  const checkOnly = process.argv.includes('--check');
  let stale = 0;

  for (const file of FILES) {
    const res = await fetch(`${UPSTREAM}/${file}`);
    if (!res.ok) {
      throw new Error(`${file}: HTTP ${res.status} from upstream`);
    }
    const upstream = await res.text();
    const local = path.join(VENDOR_DIR, file);
    const current = await fs.readFile(local, 'utf8').catch(() => null);

    if (current === upstream) {
      logger.info(`${file} is up to date`);
      continue;
    }
    stale++;
    if (checkOnly) {
      logger.warn(`${file} differs from upstream`);
      continue;
    }
    await fs.mkdir(path.dirname(local), { recursive: true });
    await fs.writeFile(local, upstream);
    logger.info(`${file} updated`);
  }

  if (checkOnly && stale > 0) {
    logger.err('Vendored contracts are stale; run "npm run sync:contracts".');
    process.exitCode = 1;
  }
}

main().catch((err: Error) => {
  logger.err(err.message);
  process.exitCode = 1;
});
