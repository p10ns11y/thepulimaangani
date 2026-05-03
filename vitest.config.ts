import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      // Avoid Invalid hook call / null dispatcher when Vitest bundles peer deps twice (React 19 + RTL).
      dedupe: ['react', 'react-dom'],
    },
    test: {
      setupFiles: ['./src/test/vitest.setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          'src/**/__tests__/**',
          'src/test/**',
          'src/routeTree.gen.ts',
          'src/wasm/**',
        ],
        thresholds: {
          lines: 80,
          functions: 75,
          branches: 75,
          statements: 80,
        },
      },
      include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.test.{ts,tsx}'],
      testTimeout: 20_000,
      hookTimeout: 15_000,
    },
  }),
)
