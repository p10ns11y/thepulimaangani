/**
 * Builders for JSON shapes produced by `parse_poem_wasm` / consumed by {@link wasmJsonToParsedPoem}.
 * Keeps tests readable and structurally consistent with serde field names.
 */

/** Syllable node under `WordNode` / `LinguisticWordNode` in Rust JSON. */
export function wasmSyllableNode(text: string, syllable_type: 'Ner' | 'Nirai' = 'Ner') {
  return { inner: { text, syllable_type, alt_split: false as const } }
}

export function wasmWordFoot(opts: {
  foot_type: string
  syllableNodes: ReturnType<typeof wasmSyllableNode>[]
  foot_index_global?: number
  word_index_in_line?: number
}) {
  const {
    foot_type,
    syllableNodes,
    foot_index_global = 0,
    word_index_in_line = 0,
  } = opts
  return {
    foot_type,
    foot_index_global,
    word_index_in_line,
    syllables: syllableNodes,
  }
}

export function wasmLinguisticWord(opts: {
  word_index_in_line: number
  syllableNodes: ReturnType<typeof wasmSyllableNode>[]
}) {
  return {
    word_index_in_line: opts.word_index_in_line,
    syllables: opts.syllableNodes,
  }
}

export function wasmPoemLine(opts: {
  line_index: number
  line_class?: string
  words?: ReturnType<typeof wasmWordFoot>[]
  linguistic_words?: ReturnType<typeof wasmLinguisticWord>[]
}) {
  return {
    line_class: opts.line_class ?? '—',
    line_index: opts.line_index,
    words: opts.words ?? [],
    linguistic_words: opts.linguistic_words ?? [],
  }
}

export function wasmPoem(lines: ReturnType<typeof wasmPoemLine>[]) {
  return { lines }
}

type WasmJsonFixtureInput = {
  original_text: string
  syllables?: unknown[]
  feet?: unknown[]
  lines?: unknown[]
  poem?: unknown
  metre_type?: string | null
  letter_count?: number
  vikalpa_count?: number
  errors?: unknown[]
  linkage?: unknown[]
  talai?: unknown[]
  presentation?: unknown
}

/**
 * Full top-level parse result object (still typed as `unknown` for the adapter under test).
 */
export function wasmParseJsonFixture(input: WasmJsonFixtureInput): unknown {
  return {
    original_text: input.original_text,
    normalized_text: input.original_text,
    syllables: input.syllables ?? [],
    feet: input.feet ?? [],
    lines: input.lines ?? [],
    linkage: input.linkage ?? [],
    talai: input.talai ?? [],
    metre_type: input.metre_type ?? null,
    letter_count: input.letter_count ?? 0,
    vikalpa_count: input.vikalpa_count ?? 0,
    errors: input.errors ?? [],
    ...(input.poem !== undefined ? { poem: input.poem } : {}),
    ...(input.presentation !== undefined ? { presentation: input.presentation } : {}),
  }
}

/** Minimal WASM JSON for {@link LivePreviewController} tests (fields the adapter reads). */
export function wasmLivePreviewControllerStub(canonText: string): unknown {
  return wasmParseJsonFixture({
    original_text: canonText,
    syllables: [{ text: 'a', syllable_type: 'Ner' }],
    feet: [{ foot_type: 'Ner', syllables: [{ text: 'a', syllable_type: 'Ner' }] }],
    lines: [
      {
        line_class: '—',
        feet: [{ foot_type: 'Ner', syllables: [{ text: 'a', syllable_type: 'Ner' }] }],
      },
    ],
    poem: { lines: [], syllables_flat: [], normalized_text: canonText, linkage: [] },
  })
}
