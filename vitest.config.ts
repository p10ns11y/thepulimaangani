import { mergeConfig } from 'vitest/config'

import vitestOnlyVite from './vitest-only.vite.config'

export default mergeConfig(vitestOnlyVite, {
  test: {
    setupFiles: ['./src/test/vitest.setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
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
})
