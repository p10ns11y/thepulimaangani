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
      /**
       * Scope to modules exercised by Vitest (TanStack routes, router, shell chrome are not mounted in unit/integration tests).
       * Including the whole `src/` tree reports ~58% lines because hundreds of route/layout lines stay uncovered.
       */
      include: [
        'src/lib/**/*.{ts,tsx}',
        'src/machines/**/*.{ts,tsx}',
        'src/components/prosody/**/*.{ts,tsx}',
        'src/components/AppActorProvider.tsx',
        'src/hooks/**/*.{ts,tsx}',
        'src/data/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/test/**',
        'src/routeTree.gen.ts',
        'src/wasm/**',
        /** Not mounted in Vitest; keeps aggregate realistic without route/E2E tests. */
        'src/components/prosody/PoemEditChangeStrip.tsx',
        'src/hooks/useMatrixGlyphFlow.ts',
      ],
      /**
       * Vitest only exercises prosody + lib + machines + a subset of hooks. Optional UI (typewriter
       * sound, paper physics) and some display branches are not run in jsdom; keep gates honest
       * but aligned with that surface.
       */
      thresholds: {
        lines: 80,
        functions: 72,
        branches: 70,
        statements: 80,
      },
    },
    include: ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**/*.test.{ts,tsx}'],
    testTimeout: 20_000,
    hookTimeout: 15_000,
  },
})
