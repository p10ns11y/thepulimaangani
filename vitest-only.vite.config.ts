/**
 * Vitest-only Vite layer — **do not** merge the app `vite.config.ts` (TanStack Start, Nitro, devtools).
 * Merging the full app config caused duplicate React / null dispatcher (`useRef`) in CI Vitest.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const repoRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '#/': path.join(repoRoot, 'src/'),
      '@/': path.join(repoRoot, 'src/'),
      react: path.join(repoRoot, 'node_modules/react'),
      'react-dom': path.join(repoRoot, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
