# Venpaa special-type spike — pause / resume handoff

**Status:** PAUSED (2026-08-02) — resume when ready; do not treat as product-shipped.  
**Owner context:** EVA session on metre ML outdatedness → rules-first subtypes (option **R**).

## Decisions locked (do not reopen lightly)

| Decision | Rationale |
|----------|-----------|
| Do **not** bulk-train hybrid/parent heads on `variation` rows | Poisons `special_type` geometry; variations stay **stress-only** |
| Finer labels (special_type names, later variations) → **classical / rule sensors first**, not hierarchical tiny ML | Anthology N≈1 poem per many subtype ids; ML memorizes |
| Hierarchical “one special-type model + 4 variation models” → **defer** until Volume/Variety gates (see M note below) | Premature at current N |
| Tamil study prose is **SoT for intent**, not for direct code translation | Sensors + decision DAG; definitions in English/machine terms |

## What landed

| Artifact | Role |
|----------|------|
| [`src/metre/venpaa_subtype.rs`](src/metre/venpaa_subtype.rs) | Sensors + decision DAG + unit tests |
| Catalogue prose | [`.grok/study-materials/tamil-ilaganam/VENPA_POEM_CLASSIFICATIONS.md`](../.grok/study-materials/tamil-ilaganam/VENPA_POEM_CLASSIFICATIONS.md) |
| Variations (Venpaa vinam) | [`.grok/study-materials/tamil-ilaganam/VENPAVINAM_CLASSIFICATION.md`](../.grok/study-materials/tamil-ilaganam/VENPAVINAM_CLASSIFICATION.md) — **not** in this spike |

**Verify:** from `tamil-seiyul-alagi/`:

```bash
cargo test metre::venpaa_subtype
```

**Spike result:** **10/10** Venpaa `special_type` anthology examples → correct `sample_id`.

### Sensors (machine defs)

1. `line_count` — non-empty physical lines  
2. `thanichol_on_second_line` — orthographic ` - ` / en-dash + trailing token on **second** line (anthology encoding of தனிச்சொல்)  
3. `ethukai_key` — consonant class of **second letter** of first cheer per line (எதுகை)  
4. `vikarpa_family_count` — distinct ethukai keys  
5. `looks_like_venpaa_line_shape` — soft 4…4 / 3 token shape (diagnostic; not a veto yet)

### Decision DAG (narrowing order)

```text
line_count
  2  → vikarpa≤1 ? oru_vikarpa_kural_venpaa : iru_vikarpa_kural_venpaa
  3  → thanichol ? nerisai_sinthiyal_venpaa : inisai_sinthiyal_venpaa
  4  → thanichol?
         yes → vikarpa≤1 oru_nerisai | =2 iru_nerisai | >2 fallback pala_inisai
         no  → vikarpa≤1 oru_inisai | else pala_inisai
  5..12 → paqrodai_venpaa
  >12   → kalivenpaa
```

Public API (also re-exported from crate root): `measure_venpaa_subtype_sensors`, `classify_venpaa_special_type`.

## Explicitly not done (resume backlog)

1. **Structural thanichol** without punctuation (parse-aware extra cheer / ethukai-linked token on line 2).  
2. **Venpaa plant vetoes** — வெண்டளை-only, ஈற்றுச்சீர் ∈ {நாள், மலர், காசு, பிறப்பு}, body ஈரசை/காய் — wire from feet/talai/presentation.  
3. **`PoemNode.line_class`** still `"—"` — not fed by this spike.  
4. **Wire into `ParseResult` / dual-truth / UI** — spike is offline API + tests only.  
5. **Other parents** (ஆசிரியப்பா / கலிப்பா / வஞ்சிப்பா special_types) — not started.  
6. **Variation catalogue** as separate rule DAGs — docs exist; no classifier yet.

## M (future paper design — not for now)

When N grows: preprocess = parse → line metrics → toḍai sensors → rule DAG primary → optional tiny head only on ambiguity.  
Data 3Vs: **Volume** ≥5–10 poems/subtype before ML; **Variety** poets/OCR/sandhi; **Velocity** active labeling on entropy/disagreement — never dump `variation` into parent/subtype train gold.

## Session trail (short)

- Coarse ML (hybrid logit on `dense[51]`) is appropriate for tiny N; not “outdated” vs Tamil peers (still rule-heavy). Global transformer SoTA needs large labeled corpora.  
- EVA: prefer **R** (Venpaa classical subtype) over multi tiny ML; **D** = defer ML; **M** = design only.  
- Human: study material is correct; pause continuation for another day.

## Resume checklist

1. Read this file + `venpaa_subtype.rs` module docs.  
2. Re-run `cargo test metre::venpaa_subtype`.  
3. Pick next backlog item (1–4 above) — default suggestion: structural thanichol + plant veto from parse.  
4. Keep `variation` out of train gold unless explicitly relabeled.
