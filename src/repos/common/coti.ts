import { createPublicClient, defineChain, http } from 'viem';

import EnvVars from '@src/common/constants/env';
import { COTI_TESTNET } from '@src/vendor/rwa/lib/contracts';

/******************************************************************************
                                Setup
******************************************************************************/

// viem ships no COTI chain; the dApp gets one from the wallet plugin, which is
// browser-only.
const cotiTestnet = defineChain({
  id: COTI_TESTNET.chainId,
  name: COTI_TESTNET.name,
  nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
  rpcUrls: { default: { http: [EnvVars.CotiRpcUrl] } },
  blockExplorers: { default: { name: 'Cotiscan', url: COTI_TESTNET.explorer } },
  contracts: {
    multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
  },
});

// The testnet RPC intermittently answers 502, so retry with backoff: six retries
// from 100ms add at most ~6s of waiting, and each attempt gives up after 5s.
export const coti = createPublicClient({
  chain: cotiTestnet,
  transport: http(EnvVars.CotiRpcUrl, {
    retryCount: 6,
    retryDelay: 100,
    timeout: 5_000,
  }),
});
