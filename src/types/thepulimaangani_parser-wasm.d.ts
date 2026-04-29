/** wasm-pack output (`pnpm run build:wasm` → `src/wasm/`); `.js` is gitignored. */

declare module '../wasm/thepulimaangani_parser.js' {
  export function parse_poem_wasm(poemText: string): string

  export default function init(
    input:
      | { module_or_path: string | ArrayBuffer | WebAssembly.Module }
      | string
      | ArrayBuffer
      | WebAssembly.Module,
  ): Promise<void>
}
