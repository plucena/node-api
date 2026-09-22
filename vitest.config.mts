import path from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

const config = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // The local rwa symlinks hold Hardhat tests that vitest would otherwise pick
    // up; it walks whichever of them it finds, so both are excluded.
    exclude: [...configDefaults.exclude, 'rwa/**', 'rwa-ui/**'],
    setupFiles: ['dotenv/config', './tests/support/agent.ts'],
    isolate: true,
    env: {
      DOTENV_CONFIG_PATH: 'config/.env.test',
    },
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
});

export default config;
