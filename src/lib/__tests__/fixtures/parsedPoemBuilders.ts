import type { ParsedFoot, ParsedLine, ParsedPoem, ParsedSyllable } from '#/types/parsedPoem'

const defaultSyllables: unknown[] = []

/** One syllable chip as the UI consumes it. */
export function parsedSyllable(text: string, syllable_type = 'Ner'): ParsedSyllable {
  return { text, syllable_type }
}

/** One foot = one linguistic word worth of syllables. */
export function parsedFoot(foot_type: string, syllables: ParsedSyllable[]): ParsedFoot {
  return { foot_type, syllables }
}

/** Shorthand: single-syllable foot. */
export function parsedFootNer(text: string): ParsedFoot {
  return parsedFoot('Ner', [parsedSyllable(text, 'Ner')])
}

export function parsedLine(feet: ParsedFoot[], line_class = '—'): ParsedLine {
  return { line_class, feet }
}

type ParsedPoemCore = Omit<ParsedPoem, 'errors'> & { errors?: string[] }

/**
 * Minimal valid {@link ParsedPoem} for layout / adapter tests.
 * Supply `lines` and `original_text`; everything else gets stable defaults.
 */
export function parsedPoem(overrides: Partial<ParsedPoemCore> & Pick<ParsedPoem, 'lines'>): ParsedPoem {
  const { errors, linkage, presentation, top_k_metre_hypotheses, parse_features, ...rest } = overrides
  const base: ParsedPoem = {
    original_text: rest.original_text ?? '',
    metre_type: rest.metre_type ?? '—',
    letter_count: rest.letter_count ?? 0,
    vikalpa_count: rest.vikalpa_count ?? 0,
    syllables: rest.syllables ?? defaultSyllables,
    lines: rest.lines,
    ...(linkage != null && linkage.length > 0 ? { linkage } : {}),
    ...(presentation != null ? { presentation } : {}),
    ...(top_k_metre_hypotheses != null && top_k_metre_hypotheses.length > 0
      ? { top_k_metre_hypotheses }
      : {}),
    ...(parse_features != null ? { parse_features } : {}),
  }
  return errors != null && errors.length > 0 ? { ...base, errors } : base
}
