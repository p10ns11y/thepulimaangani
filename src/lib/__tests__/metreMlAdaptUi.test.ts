import { describe, expect, it } from 'vitest'

import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'

/**
 * Real adapt path: fixture shaped like Rust ParseResult v2 `metre_ml` wire JSON.
 * Proves UI-facing fields come from parse JSON keys via adaptWasmJsonToParsedPoem.
 */
describe('metre_ml adapt → ParsedPoem (product surface)', () => {
  const wire = {
    parse_result_schema_version: 2,
    original_text: 'கற்றது கைம்மண்ணளவு',
    normalized_text: 'கற்றது கைம்மண்ணளவு',
    letter_count: 10,
    vikalpa_count: 0,
    poem: { normalized_text: '', lines: [], syllables_flat: [], linkage: [] },
    syllables: [],
    feet: [],
    linkage: [],
    talai: [],
    lines: [],
    metre_type: 'Venpaa',
    top_k_metre_hypotheses: [
      {
        metre_type: 'Venpaa',
        aggregate_score: 90,
        violations: [],
        rule_ids: [],
        metre_probability: 0.72,
        metre_rank: 1,
      },
      {
        metre_type: 'Aciriyappaa',
        aggregate_score: 40,
        violations: [],
        rule_ids: [],
        metre_probability: 0.18,
        metre_rank: 2,
      },
    ],
    parse_features: {
      schema_version: 1,
      dense: Array.from({ length: 51 }, (_, i) => (i === 12 ? 0.8 : 0.01)),
    },
    metre_entropy_bits: 1.25,
    metre_epistemic_margin: 0.4,
    confidence: 90,
    provenance: [],
    errors: [],
    presentation: { metre_type: 'வெண்பா', feet: [], talai: [] },
    metre_ml: {
      dual_truth: {
        ml_metre_type: 'Venpaa',
        classical_metre_type: 'Venpaa',
        classical_ok_for_ml_top: true,
        classical_violations: [],
        separation_policy: 'ml_scores_parallel_to_classical_violations',
      },
      pattern_features: [
        {
          dense_index: 12,
          feature_id: 'linkage_type_bin_0',
          weight: 0.8,
          direction: 'positive',
        },
      ],
      head_votes: [
        {
          head_id: 'heuristic_or_hybrid',
          metre_type: 'Venpaa',
          score: 0.72,
          note: 'Shipped parse path',
        },
        {
          head_id: 'dense_logistic',
          metre_type: 'Venpaa',
          score: 0.65,
          note: 'Pure dense',
        },
      ],
      honesty_label: 'Statistical estimate (ML / heuristic) — not classical proof',
      uncertainty_blurb:
        'Entropy and confidence gap describe how peaked the four-way ML distribution is — not classical proof.',
      a12_freeze_date: '2026-07-27',
    },
  }

  it('adapts metre_ml honesty, dual_truth, heads, and pattern features from wire JSON', () => {
    // Cast: wire is a partial OpenAPI-shaped object; adapt accepts unknown/loose JSON.
    const poem = adaptWasmJsonToParsedPoem(wire as never)
    expect(poem).not.toBeNull()
    if (!poem) return
    // presentation.metre_type is preferred for display when present
    expect(poem.metre_type).toBe('வெண்பா')
    expect(poem.metre_ml?.honesty_label).toContain('Statistical estimate')
    expect(poem.metre_ml?.dual_truth.ml_metre_type).toBe('Venpaa')
    expect(poem.metre_ml?.dual_truth.separation_policy).toBe(
      'ml_scores_parallel_to_classical_violations',
    )
    expect(poem.metre_ml?.dual_truth.classical_ok_for_ml_top).toBe(true)
    expect(poem.metre_ml?.pattern_features[0]?.feature_id).toBe('linkage_type_bin_0')
    expect(poem.metre_ml?.pattern_features[0]?.dense_index).toBe(12)
    expect(poem.metre_ml?.pattern_features[0]?.weight).toBe(0.8)
    expect(poem.metre_ml?.head_votes.map((h) => h.head_id)).toEqual([
      'heuristic_or_hybrid',
      'dense_logistic',
    ])
    expect(poem.metre_ml?.head_votes[0]?.score).toBe(0.72)
    expect(poem.metre_ml?.a12_freeze_date).toBe('2026-07-27')
    expect(poem.metre_entropy_bits).toBe(1.25)
    expect(poem.top_k_metre_hypotheses?.[0]?.metre_probability).toBe(0.72)
  })

  it('omits metre_ml when wire block missing (legacy parse)', () => {
    const { metre_ml: _drop, ...legacy } = wire
    const poem = adaptWasmJsonToParsedPoem(legacy as never)
    expect(poem).not.toBeNull()
    if (!poem) return
    expect(poem.metre_ml).toBeUndefined()
    expect(poem.metre_type).toBe('வெண்பா')
  })
})
