import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { nitro } from 'nitro/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Nitro is required for TanStack Start on Vercel. Match the official example (`nitro()` only):
// https://vercel.com/docs/frameworks/full-stack/tanstack-start — preset is chosen via env / `NITRO_PRESET` (see `vercel.json` buildCommand).
const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
})

export default config
