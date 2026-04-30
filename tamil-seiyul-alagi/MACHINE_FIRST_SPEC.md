# Machine-First Prosody Spec (Normative)

Status: Draft v0.1
Owner branch: `thumpi`
Base branch: `malar`

This is the single source of truth for the machine-first redesign of the Tamil prosody engine. All other docs (study materials, migration notes, presentation labels) reference this spec rather than redefine its rules.

---

## 1. Architectural Contract

Two strict layers, no leaks:

- **Core (machine-first)**
  - Pure logic. Typed enums. Integer scoring. No Tamil display strings.
  - Lives under `tamil-seiyul-alagi/src/`.
  - Outputs structured hypotheses with rule-IDs, scores, violations.
- **Presentation (human-first)**
  - Maps core IDs/enums to Tamil names, classical narrative, educational text.
  - **`presentation.rs`** builds `ParseResult.presentation` (serialized with WASM JSON) so every client gets the same foot and தளை labels without reimplementing tables.
  - The web app may duplicate small maps for offline fallbacks only when `presentation` is missing (older artifacts).

Naming policy:
- Core module names use machine-first English: `linkage.rs` (not `talai.rs`), `foot.rs`, `metre.rs`, `syllable.rs`, etc.
- Core type names use machine-first English: `LinkageClass`, `FootPattern`, `MetreHypothesis`. Tamil **prose** labels for feet and தளை are **not** in core logic; they are emitted only inside **`ParseResult.presentation`** (see `presentation.rs`).
- Exception for canonical grammar identifiers: when a concept is a standard classical-grammar term without a clean neutral replacement, keep the canonical term in English-Latin form (e.g., `VenTalai`, `AsiriyaTalai`) inside enum variants while preserving English container names (`LinkageType`).

---

## 2. Rule ID Registry

Every core decision attaches a stable `RuleId`. Format:

```
<COMPONENT>-<TOPIC>-<NN>
```

Examples:
- `SYL-NIRAI-01` — Nirai-formation rule #1
- `FOOT-WIDTH-02` — Allowed width rule #2
- `LINK-BOUNDARY-03` — Linkage boundary classification #3
- `METRE-VENPAA-01` — Venpaa hard constraint #1

Rules are versioned. A rule never silently changes meaning; either the body changes with the same ID and a doc note, or a new ID supersedes the old one.

The registry lives in code as a single typed enum (later phase), with a docstring per variant pointing to the exact section in this spec.

---

## 3. Core Data Model (machine-first)

Conceptual shape (final Rust types refined later):

- `ProsodicUnit` — atomic segmental unit (vowel, consonant, uyirmei, etc.).
- `Asai` — prosodic metreme. Variants: `Ner`, `Nirai`, plus future `NerPu`, `NiraiPu` if needed.
- `FootCandidate` — a span of asai forming a possible foot. Carries `signature`, `width`, `feature_vector`, `score`, `rule_ids`.
- `LinkageCandidate` — adjacency between two `FootCandidate`s. Carries `class_id`, `is_valid`, `violations`, `score`, `rule_ids`.
- `MetreHypothesis` — a global interpretation. Carries `metre_id`, `aggregate_score`, `violations`, `rule_ids`, `selected_foot_path`, `selected_linkage_path`.
- `ParseResult`
  - `winner: MetreHypothesis`
  - `top_k: Vec<MetreHypothesis>`
  - `confidence: i32`  (fixed-point)
  - `provenance: Vec<RuleId>`
  - existing fields stay for backward compatibility.

---

## 4. Stage Specifications

### 4.1 Foot Stage

**Current shipped code** (interim): [`src/foot.rs`](src/foot.rs) groups syllables into **one foot per linguistic word** (same line + word index); [`src/foot_pattern.rs`](src/foot_pattern.rs) sets `foot_type` to a hyphenated **Ner/Nirai** pattern (for example `Ner-Ner`), not classical தேமா names. The lattice algorithm below is the **target** once the machine-first foot stage lands.

Algorithm (lattice-based segmentation):

1. Accept `[Asai]` for a line.
2. Enumerate candidate foot spans of allowed widths (start with 2..=4 asai).
3. For each span:
   - Compute `pattern_signature` (asai-type sequence).
   - Compute `feature_vector` (length, boundary closure, weight class).
   - Score with deterministic integer scoring.
4. Build a directed lattice over span boundaries.
5. Return all candidates plus best-path projection (used by metre stage).

Out-of-scope here: classical foot naming. That mapping lives in `presentation.rs` (serialized as `ParseResult.presentation`).

### 4.2 Linkage Stage (renamed from `talai`)

Module: [`src/linkage.rs`](src/linkage.rs) (successor to the historical `talai` naming).

**Current shipped code** (`linkage.rs`) classifies each consecutive pair using the **previous foot’s last acai** (Maa/Vilam for 1–2 acai per foot, Kaai/Kani for 3+) and the **next foot’s first acai** (Ner/Nirai). JSON exposes **`linkage_type`** (coarse: `Venthalai`, `Aasiriyathalai`, `Kalithalai`, `Vanjithalai`) and **`linkage_special_type`** (e.g. `VencirVenthalai`, `NerondriyaAasiriyathalai`). The lattice wording below remains the **target** once `FootCandidate` paths exist.

Algorithm:

1. For each adjacent pair of `FootCandidate`s on a chosen foot path:
   - Extract `left.end_features` and `right.start_features`.
   - Look up `LinkageClass` from a typed transition table.
   - Mark `is_valid` based on hard constraints in the table.
   - Append `violations` and supporting `rule_ids`.
2. Emit `[LinkageCandidate]` for the path.

`presentation.rs` maps `LinkageSpecialType` (and coarse `LinkageType` when special is `Unknown`) to Tamil strings on each `DisplayTalai`.

### 4.3 Metre Stage

Replaces the `feet.len() >= 4` heuristic in [`src/metre.rs`](src/metre.rs).

Algorithm:

1. For each candidate metre, evaluate a typed constraint object:
   - hard constraints (line shape, ending class, mandatory linkage class set);
   - soft constraints (preference rules with weights).
2. Score each metre against the foot path and linkage path produced by stages 4.1 and 4.2.
3. Rank using deterministic ordering (see §5).
4. Return `top_k` with violations and rule IDs.

---

## 5. Determinism Rules

Tie-breaking order (applied left-to-right):

1. Higher `aggregate_score` (integer).
2. Fewer hard violations.
3. Fewer soft violations.
4. Earlier (lower) lexicographic `metre_id`.
5. Earlier (lower) `rule_id` sequence.

All scores are integers; no floats in core. This guarantees stable top-k across runs and platforms.

---

## 6. Diagnostic Output Contract

`ParseResult.top_k[i]` always carries:

- `metre_id`
- `aggregate_score`
- `violations: Vec<{ rule_id, severity, span }>`
- `selected_foot_path` and `selected_linkage_path`
- `rule_ids`

Consumers may render only the winner; the lattice and top-k remain available for explainability and tests.

---

## 7. Migration & Rename Map

| Current core name | New core name | Notes |
|---|---|---|
| `src/talai.rs` | `src/linkage.rs` | machine-first naming |
| `Talai` | `LinkageCandidate` | type rename |
| `TalaiType` | `LinkageType` (coarse) + `LinkageSpecialType` | metre vs nuanced bond |
| `Foot.foot_type: String` | `Foot.pattern: FootPattern` (enum) | typed signature |
| `MetreType` | `MetreId` (enum) | wire-compatible Display impl in UI layer |

Old top-level fields stay for compatibility during phased rollout; new fields are additive.

---

## 8. Test & Validation Contract

Required guarantees before flipping defaults:

- Determinism test: same input, same top-k, byte-stable JSON.
- Lattice test: foot enumeration yields all and only allowed widths.
- Linkage table test: every `(left.end_class, right.start_class)` resolves to one `LinkageClass`.
- Metre constraint test: at least one passing fixture per supported metre.
- Char-safe slicing in [`tests/test_poem_variations.rs`](tests/test_poem_variations.rs); must use grapheme/char boundaries.

---

## 9. Out of Scope (this phase)

- New metres beyond what is currently enumerated.
- Frontend changes beyond consuming new optional fields.
- CI; will be wired in a later sprint.

---

## 10. Change Log

- v0.1 — initial draft on `thumpi` branch.
- v0.2 — naming rule clarified: English container types with canonical grammar-specific variant names (e.g., `VenTalai`).
- v0.3 — §4.2: shipped one-foot-per-word path uses the eight-way transition table ([issue #36](https://github.com/p10ns11y/thepulimaangani/issues/36)); lattice `FootCandidate` linkage remains future work.
- v0.4 — §4.2: split **coarse** `LinkageType` vs **nuanced** `LinkageSpecialType`; cir **Vilam** (விளம்) replaces Vilai in code/docs.
