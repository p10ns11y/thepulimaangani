import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('classical tree overview chain', () => {
  it('keeps one இல்லை fall-through per gate in the code order', () => {
    const scriptPath = resolve(process.cwd(), 'docs/check-classical-tree-overview.mjs')
    const output = execFileSync(process.execPath, [scriptPath], { encoding: 'utf8' })
    expect(output).toContain('overview chain ok')
  })
})
