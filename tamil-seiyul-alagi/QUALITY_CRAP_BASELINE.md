# QUALITY_CRAP_BASELINE

Purpose: keep a lightweight, versioned CRAP-style risk baseline for parser-core code.

This file is intentionally simple today (manual scoring).  
Later, CI can compute and validate the same baseline automatically.

---

## Baseline Snapshot

- Date: 2026-04-26
- Scope: `tamil-seiyul-alagi/src/*` parser core
- Baseline method: manual CRAP-style score
- Total baseline score: 23

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
| `src/metre.rs::detect_metre` | 3 | 3 | 9 | critical | Current heuristic misclassifies known Aciriyappaa fixture. |
| `src/syllable_builder.rs::build` | 3 | 2 | 6 | high | Ordered regex branching with boundary-sensitive behavior. |
| `src/lib.rs::parse_poem` | 2 | 2 | 4 | moderate | Pipeline fan-out can silently break output structure. |
| `src/linkage.rs::analyze_linkage` | 2 | 2 | 4 | moderate | Placeholder constant linkage classification and validity. |
| `src/foot.rs::group_into_feet` | 2 | 2 | 4 | moderate | Placeholder chunking/cyclic naming not rule-driven yet. |

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

