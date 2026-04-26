import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { nitro } from 'nitro/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Nitro is required for TanStack Start on Vercel (server output + functions wiring).
// See https://vercel.com/docs/frameworks/full-stack/tanstack-start
const isVercel = Boolean(process.env.VERCEL)

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // `vercel` preset emits output Vercel Functions understand; `node-server` for local `vite preview`.
  nitro: {
    preset: isVercel ? 'vercel' : 'node-server',
  },
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
})

export default config
