import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

const repoRoot = path.dirname(fileURLToPath(import.meta.url))

/** Force one physical React copy — fixes Invalid hook call / null dispatcher in Vitest workers (CI). */
function reactResolveAliases(): Record<string, string> {
  return {
    react: path.join(repoRoot, 'node_modules/react'),
    'react-dom': path.join(repoRoot, 'node_modules/react-dom'),
  }
}

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: reactResolveAliases(),
    },
    test: {
      setupFiles: ['./src/test/vitest.setup.ts'],
      /** Single fork avoids multiple workers each resolving React differently (pnpm + Vitest). */
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
  }),
)
