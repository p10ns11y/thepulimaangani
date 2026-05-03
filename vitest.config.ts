import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
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
      /** Integration tests mock debounce timers; WASM remains real and async. */
      testTimeout: 20_000,
      hookTimeout: 15_000,
    },
  }),
)
