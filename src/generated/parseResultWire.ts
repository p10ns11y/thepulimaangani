/**
 * Thin aliases over openapi-typescript output so call sites import domain names,
 * not `components["schemas"][…]` paths.
 *
 * Regenerate the underlying types with `pnpm run codegen:parse-result-client`.
 */
import type { components } from '#/generated/parseResult.wire'

/** WASM / JSON wire shape from `parse_poem` / `parse_poem_wasm` (Rust `ParseResult`). */
export type ParseResultWire = components['schemas']['ParseResult']

/** OpenAPI `components` bag for advanced use (schemas only; paths are empty). */
export type ParseResultOpenApiComponents = components
