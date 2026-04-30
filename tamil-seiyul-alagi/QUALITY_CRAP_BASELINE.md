# QUALITY_CRAP_BASELINE

Purpose: keep a lightweight, versioned CRAP-style risk baseline for parser-core code.

This file is intentionally simple today (manual scoring).  
Later, CI can compute and validate the same baseline automatically.

---

## Baseline Snapshot

- **Date:** 2026-04-29 _(updated; prior snapshot 2026-04-26 below)_
- **Scope:** `tamil-seiyul-alagi/src/*` parser core
- **Baseline method:** manual CRAP-style score
- **Total baseline score (sum of hotspot rows):** 33  
  _(Interpret as aggregate risk surface; not a single function CRAP metric.)_

Scoring formula:

`manual_crap_score = complexity_rank * untested_rank`

Rank scale:

- complexity_rank: `1 low`, `2 medium`, `3 high`
- untested_rank: `1 high confidence`, `2 medium confidence`, `3 low confidence`

Interpretation:

- `1-2`: low risk
- `3-4`: moderate risk
- `6`: high risk
- `9`: critical risk

---

## Current Hotspots

| Module / Function | Complexity Rank | Untested Rank | Score | Risk | Why |
|---|---:|---:|---:|---|---|
| `src/metre.rs::detect_metre` | 3 | 3 | 9 | critical | Heuristic still misclassifies known Asiriyappaa fixture; metre hypotheses naive. |
| `src/lib.rs::parse_poem` | 3 | 2 | 6 | high | Orchestrates word segmentation, feet, `PoemNode` tree, linkage; integration surface grew. |
| `src/syllable_builder.rs::build_inner` | 2 | 2 | 4 | moderate | Ordered regex scan per **linguistic word**; unit tests cover common paths. |
| `src/word_scope.rs::segment_syllables_from_normalized` | 2 | 2 | 4 | moderate | Line/word tokenization drives all downstream syllables; integration-heavy. |
| `src/linkage.rs::foot_positions_for_poem` + `analyze_linkage` | 2 | 2 | 4 | moderate | Positions correct; `linkage_type` / validity still largely placeholder. |
| `src/poem_tree.rs::build_poem_tree` + `linguistic_words_per_line` | 2 | 2 | 4 | moderate | Tree + parallel linguistic grouping; must stay aligned with `ParseResult.lines`. |
| `src/foot.rs::group_into_feet_with_ranges` | 2 | 1 | 2 | low | One foot per linguistic word + `foot_pattern()` Ner-Nirai string; covered by foot tests. |

**Dropped from prior table (superseded):**

- `foot.rs` placeholder **chunks of 3** — replaced by linguistic-word grouping + pattern strings.
- `syllable_builder.rs::build` as monolithic stream — replaced by per-word `build_word_segment` / `build_inner`.

---

## Changelog

| Date | Note |
|------|------|
| 2026-04-26 | Initial baseline (chunk feet, flat syllable stream). Total hotspot sum was 27 if all rows summed (doc previously said 23). |
| 2026-04-29 | Great refactor: `word_scope`, `poem_tree`, `FootPosition` linkage, Ner-Nirai `foot_type` patterns, per-word syllable segmentation. Hotspots and total refreshed. |

---

## Usage Rules

Use this baseline in PR review and ongoing development:

1. If a PR changes parser-core logic, update this table.
2. If any row score is `>= 6`, add at least one direct test before merge.
3. If a score increases, explain why in PR notes.
4. Keep row count concise (prefer top 5-8 hotspots).

---

## CI Migration Plan (Later)

When CI is ready:

1. Collect coverage (`cargo tarpaulin` or `cargo llvm-cov`).
2. Collect complexity metrics (function-level).
3. Compute CRAP-style scores automatically.
4. Compare CI scores against this baseline and report deltas.
5. Start in report-only mode; enforce thresholds after stable baseline history.

**Implemented (2026-04-30):** GitHub Actions job `crap_analysis` runs `cargo llvm-cov`, Vitest `--coverage`, Lizard XML, and `dx/crap_report.py`; uploads `crap-report.md` as an artifact (report-only; optional `--max-mean` gate in the script).
