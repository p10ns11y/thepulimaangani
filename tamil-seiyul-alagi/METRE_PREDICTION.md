# Coarse metre prediction — first principles, second-order effects, third order

This document describes **how** the shipped coarse-metre stack reasons, **what breaks when you change one part**, and **what happens one or two steps beyond the obvious** (tests, UI, classical truth, and future refactors).

**Code map**

| Layer | File | Role |
|--------|------|------|
| Heuristic head | [`src/metre/prediction.rs`](src/metre/prediction.rs) | Rule priors + linkage tilts + dense boost into four `MetreHypothesis` rows |
| Hybrid head | [`src/metre/ml_head.rs`](src/metre/ml_head.rs) + [`src/metre/metre_hybrid_weights.inc.rs`](src/metre/metre_hybrid_weights.inc.rs) | Optional logit on fixed features; softmax probabilities and reorder |
| Linkage summaries | [`src/metre/fractions.rs`](src/metre/fractions.rs) | Coarse Talai family fractions (shared) |
| Classical (future) | [`src/metre/classical_checker.rs`](src/metre/classical_checker.rs) | Placeholder violations; **not** wired to the head’s score yet |
| Orchestration | [`src/lib.rs`](src/lib.rs) `parse_poem` | Builds features, runs heuristic → optional hybrid, fills `ParseResult` |

---

## 1. First principles

### 1.1 What is being predicted?

- **Target:** One of four **coarse** metres (`Venpaa`, `Aciriyappaa`, `Kalippaa`, `Vanjippaa`) for the parsed poem fragment.
- **Not predicted here:** Subtype labels (தாழிசை, துறை, …), line-acai classical line shapes, or full yāppu legality. Those live in human catalogues and in [`MACHINE_FIRST_SPEC.md`](MACHINE_FIRST_SPEC.md) as **targets**, not as guarantees from this stack.

### 1.2 What observables does the model use?

1. **Structural:** Number of **feet** (one foot per segmented linguistic word), not “classical feet per line” in the catalogue sense. `feet.len()` drives the **rule prior** split (`long` vs short in `rule_prior_score`).
2. **Linkage:** Coarse fractions of `VenTalai` / `AciriyaTalai` / `KaliTalai` / `VanjiTalai` over edges (see [`PARSE_FEATURES.md`](PARSE_FEATURES.md) for how the same signal appears in `dense`).
3. **Parse features:** The **51-float** `dense` vector (global counts, linkage histograms, special-bond mass, foot-pattern bins, line-foot histogram). Built **after** feet and linkage exist; same vector is used for training export and hybrid input.

**Principle:** The head never reads raw Tamil as a feature vector; it reads **already committed** pipeline outputs. If syllable segmentation or linkage rules change, the meaning of “the same index in `dense`” changes — that is a **schema / contract** issue, not a small constant tweak.

### 1.3 What is the output contract?

- **`top_k_metre_hypotheses`:** Up to four rows, same four `MetreType` variants, each with `aggregate_score`, `rule_ids`, optional `metre_probability` / `metre_rank` after hybrid.
- **After hybrid (when active):** `aggregate_score` is **approximately 100 × softmax probability** for ranking; `metre_probability` is the calibrated mass; `metre_entropy_bits` and `metre_epistemic_margin` on `ParseResult` summarize the **whole** four-way distribution, not a single class.
- **`metre_type`:** Head of the list after the full pipeline — UI and adapters should treat it as **best guess**, not proof of classical metre.

### 1.4 Conservation and consistency

- **Four hypotheses always** (when detection is on): the space of hypotheses is **closed** under the four coarse types; there is no fifth row from this head.
- **Softmax:** Hybrid probabilities sum to 1 over those four; entropy and margin are derived from the same vector.
- **Separation of concerns:** `classical_checker` is intentionally **orthogonal** today: it does not subtract from the hybrid score. When classical rules land, you must decide explicitly whether they **filter**, **re-rank**, or only **annotate** `violations` — mixing them silently into the same integer score without a spec will create double-counting.

---

## 2. Second-order effects

Second-order = **interactions inside the same parse** when you change one stage or flag.

| Cause | Effect |
|--------|--------|
| **`boost_metre_hypotheses_with_dense` before hybrid** | The hybrid branch builds a feature that includes **softmax(heuristic scores / τ)**. So any change to heuristic constants or dense boost **changes the hybrid input**, not only the pre-hybrid ordering. |
| **`ParseOptions::skip_ml_metre`** | Training export uses `poem_variations_training()` with hybrid **off**, so CSV / Monte Carlo baselines stay comparable to “heuristic + dense” literature unless you intentionally enable hybrid for an experiment. |
| **Heuristic `aggregate_score` scale** | Before hybrid, scores are arbitrary integers (rules + boosts). After hybrid, top hypothesis score is **probability-scaled**. Downstream code that assumed “> 75 means strong Venpaa rule” must use **`skip_ml_metre`** in tests or compare **`metre_probability`**. |
| **`hybrid_head_is_active`** | If shipped weights are all zeros (stub), hybrid is skipped; behaviour collapses to heuristic-only **without** a separate code path in callers — silent fallback. |
| **`METRE_ML_WEIGHT_SCHEMA` / `PARSE_FEATURE_SCHEMA_VERSION` mismatch** | Hybrid refuses to run if schema does not match; you get heuristic-only output **without** failing the parse. **Second-order:** tests that assert `metre_entropy_bits.is_some()` assume weights are shipped and active. |
| **Linkage vs dense duplication** | Linkage fractions appear both in **heuristic** logic and inside **`dense`**. Tuning one path without the other can create **internal disagreement** (heuristic says A, dense channel says B); hybrid is partly there to reconcile that tension. |

---

## 3. Third order (third-degree effects)

Third order = **consequences outside the immediate function** — time, people, CI, classical truth, and product.

### 3.1 Dataset and weights

- **Refit `metre_hybrid_weights.inc.rs`** without bumping `METRE_ML_WEIGHT_SCHEMA` when layout unchanged: **tests can pass** while **production behaviour drifts** (different probabilities, same API). Prefer recording **why** the refit happened in the commit message and, when layout changes, bump schema and reject stale clients.
- **Small-N fit** (`special_type` rows): high training accuracy does **not** bound generalization error on new poets or OCR’d text. Entropy and margin are **honesty signals** for out-of-sample use, not guarantees.
- **Variation rows** in `poem_variations.js`: gold `parent_metre` may still disagree with the head on **variation** lines by design; using them as bulk supervision without relabelling **poisons** offline fits.

### 3.2 Parser and feature pipeline

- Any change to **footing**, **linkage table**, or **dense layout** propagates: hybrid weights become **wrong** until refit. **Third-order:** WASM clients caching old `parse_features` layout must bump together with the app.
- **Monte Carlo tests** (`shuffle_labels_for_iteration`): they stress **ordering sensitivity** of the heuristic path; they do not automatically validate hybrid unless the same options run hybrid.

### 3.3 Classical truth and product

- **`presentation.metre_type`** is derived from the **same** `metre_type` as the head. If classical checker later **contradicts** the head, the UI must choose whether to show “detected” vs “scholarly” metre — a **product** decision, not a parser default.
- **User trust:** Showing `metre_probability` as “confidence” **without** entropy/margin invites over-trust on flat distributions (high top-1 prob can still be wrong if the model was miscalibrated on that slice of the manifold).

### 3.4 Architecture and debt

- **`QUALITY_CRAP_BASELINE.md`** and issue **#49** track doc vs code drift. This file is a **contract** for metre prediction; when you add a fifth coarse metre or a second stage model, update **first principles** here first, then code.

---

## Related reading

- [`PARSE_FEATURES.md`](PARSE_FEATURES.md) — `dense` layout and metre boost indices  
- [`TRAINING_PROCESS.md`](TRAINING_PROCESS.md) — CSV / JSONL, Monte Carlo, hybrid fitter example  
- [`MACHINE_FIRST_SPEC.md`](MACHINE_FIRST_SPEC.md) — classical target behaviour vs current heuristics  
- [`QUALITY_CRAP_BASELINE.md`](QUALITY_CRAP_BASELINE.md) — risk register row for metre head  

---

## Changelog (manual)

| Date | Change |
|------|--------|
| 2026-05 | Initial document: heuristic + hybrid + `skip_ml_metre` + three-level reasoning |
