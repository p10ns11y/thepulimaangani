/**
 * Generate TypeScript types from `src/generated/parseResult.openapi.json`
 * (OpenAPI 3 `components.schemas` from Rust / schemars).
 *
 * Run: `pnpm run codegen:parse-result-client`
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import openapiTS, { astToString, COMMENT_HEADER } from 'openapi-typescript'

const parseResultOpenApiPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'generated',
  'parseResult.openapi.json',
)

const parseResultWireTypesPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'generated',
  'parseResult.wire.ts',
)

const parseResultOpenApiJson = fs.readFileSync(parseResultOpenApiPath, 'utf8')

const rawTypes = await openapiTS(parseResultOpenApiJson, {
  cwd: path.dirname(parseResultOpenApiPath),
  silent: true,
})
const typescriptSource = `${COMMENT_HEADER}${astToString(rawTypes)}`

fs.writeFileSync(parseResultWireTypesPath, typescriptSource, 'utf8')
console.error(`Wrote ${parseResultWireTypesPath}`)
