# Ontology map — Tamil prosody parser (S00)

**Status:** inventory freeze for metre-ML SOA foundation  
**Date:** 2026-07-27  
**Agent:** theni (parser / core data / WASM truth)  
**Contract:** [`tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md`](../../../tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md) §5.0 `S00_ontology_map`, §5.2 Ontology  
**Spec:** [`tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md`](../../../tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md)

**Scope:** what *exists* as typed entities and relations in shipped code.  
**Out of scope:** classical metre rule implementation; merging classical into ML scores; dense formula semantics (S01); anthology row inventory (S02).

### Machine-readable catalog (public API)

Rust module: `tamil-seiyul-alagi/src/ontology_map.rs` (crate root re-exports).  
`ONTOLOGY_MAP_VERSION = 1` — bump when any catalog id set or meaning changes (S03 fingerprint).

| Export | Value |
|--------|--------|
| `ontology_structural_entity_ids()` | `Poem`, `Line`, `Foot`, `Syllable`, `Letter` |
| `ontology_syllable_type_ids()` | `Ner`, `Nirai` |
| `ontology_cir_class_ids()` | `Maa`, `Vilam`, `Kaai`, `Kani` |
| `ontology_metre_type_fixed_ids()` | `Venpaa`, `Aciriyappaa`, `Kalippaa`, `Vanjippaa` |
| `ontology_linkage_type_fixed_ids()` | `VenTalai`, `AciriyaTalai`, `KaliTalai`, `VanjiTalai` |
| `ontology_linkage_special_ids()` | 8 wire keys (dense order 0..7), incl. `Unknown` |
| `ontology_issue36_bond_table_len()` | `8` |
| `ontology_dual_truth_channel_ids()` | `ml_metre`, `classical_metre` (parallel; never fused) |

Integration lock: `tests/test_ontology_map_s00.rs`. Unit exhaustiveness: `ontology_map` lib tests.

---

## 1. Entity table + source files

### 1.1 Structural hierarchy (containment)

| Entity | Rust type(s) | Source | Role |
|--------|----------------|--------|------|
| **Poem** | `PoemNode` | `tamil-seiyul-alagi/src/poem_tree.rs` | Root aggregate: normalized text, lines, flat syllables, linkage edges |
| **Line** (physical) | `PoemLineNode`; legacy flat `types::Line` | `poem_tree.rs`, `types.rs` | One normalized physical line; `line_class` currently placeholder `"—"` |
| **Linguistic word** | `LinguisticWordNode` | `poem_tree.rs` | Whitespace-separated token on a line; holds syllables *without* foot merge across spaces |
| **Word / Foot** | `WordNode` (tree); `Foot` + `FootPlacement` (pipeline) | `poem_tree.rs`, `foot.rs` | Prosodic foot ≈ one linguistic word today |
| **Syllable (அசை)** | `Syllable`, `SyllableNode` | `syllable.rs`, `poem_tree.rs` | Surface text + Ner/Nirai + line/word indices |
| **Letter (எழுத்து)** | `Letter`, `LetterNode` | `letter.rs`, `poem_tree.rs` | Grapheme-level under syllable; type + matra |
| **Prosodic unit** | `ProsodicUnit`, `Vowel`, `Consonant` | `prosodic_unit.rs` | Machine segmental classification feeding letters |

**Parse surface (WASM / serde root):** `ParseResult` in `types.rs` — carries `poem: PoemNode` **and** parallel flat arrays (`syllables`, `feet`, `linkage`/`talai`, `lines`) for adapters.

### 1.2 Prosodic / classification enums

| Entity | Rust type | Variants (canonical JSON where renamed) | Source |
|--------|-----------|------------------------------------------|--------|
| **SyllableType** | `SyllableType` | `Ner`, `Nirai` | `syllable.rs` |
| **Cir (சீர்) class** | `CirAcaiClass` | `Maa`, `Vilam`, `Kaai`, `Kani` | `linkage.rs` |
| **LetterType** | `LetterType` | `Uyir`, `Mei`, `Uyirmei`, `Aaytham` | `letter.rs` |
| **Foot pattern** | `String` on `Foot.foot_type` | Hyphenated Ner/Nirai e.g. `Ner-Ner` (not a closed enum) | `foot_pattern.rs` |
| **Coarse Talai family** | `LinkageType` | see §3 | `linkage.rs` |
| **Special bond** | `LinkageSpecialType` | see §3 | `linkage.rs` |
| **Coarse metre** | `MetreType` | see §3 | `metre/mod.rs` |
| **Rule provenance** | `RuleId` | `MetreLength01`, `LinkageAdjacency01`, `Other(String)` | `types.rs` |

### 1.3 Edges and positions

| Entity | Rust type | Source | Role |
|--------|-----------|--------|------|
| **Linkage edge** | `Linkage` (`Talai` alias) | `linkage.rs` | Bond between consecutive feet: `from_foot`/`to_foot`, positions, coarse + special type, `is_valid` |
| **Foot position** | `FootPosition` | `linkage.rs` | `foot_index`, `line_index`, `word_index_in_line` |
| **Foot placement** | `FootPlacement` | `foot.rs` | Foot + syllable index `Range` in poem-wide list |

### 1.4 Metre / truth / features (non-structural)

| Entity | Rust type / field | Source | Ontology note |
|--------|-------------------|--------|---------------|
| **Metre hypothesis** | `MetreHypothesis` | `types.rs` | Candidate class + integer `aggregate_score` + optional hybrid `metre_probability` / `metre_rank` |
| **Winner metre** | `ParseResult.metre_type: Option<MetreType>` | `types.rs`, `lib.rs` | Top-1 after heuristic (+ dense boost + hybrid unless `skip_ml_metre`) |
| **ML head** | `HybridMetreHead`, `METRE_ML_NUM_CLASSES = 4` | `metre/ml_head.rs` | Softmax over Venpaa/Aciriyappaa/Kalippaa/Vanjippaa only (`Other` not a class) |
| **Classical channel** | `classical_violations_for_metre` | `metre/classical_checker.rs` | **Placeholder:** always `[]` |
| **Parse features** | `ParseFeatureSnapshot` / `ParseFeatureVector` dense[51] | `parse_features.rs`, `types.rs` | **Derived observables**, not ontology primitives (S01 owns semantics) |
| **Presentation** | `DisplayResult` / `DisplayFoot` / `DisplayTalai` | `presentation.rs` | Human Tamil/Latin labels; not machine ontology |
| **Anthology gold** | `parent_metre` slug → `MetreType` | `poem_variations_training.rs` | Anthology (S02); maps `venpaa`/`aciriyappa`/`kalippaa`/`vanjippaa` |

### 1.5 Trait contracts (traversal)

From `poem_tree.rs`:

| Trait | Layer |
|-------|--------|
| `LetterLayer` | Letter |
| `SyllableLayer` | Syllable + letters + global index |
| `WordLayer` | Foot/word syllables + `foot_type` + indices |
| `LineLayer` | Line index + words + `line_class` |
| `PoemLayer` | Lines + linear syllables + linkage + source text |

---

## 2. Relations

### 2.1 Containment (hierarchical)

```text
PoemNode
  ├── lines[]: PoemLineNode
  │     ├── linguistic_words[]: LinguisticWordNode
  │     │     └── syllables[]: SyllableNode
  │     │           └── letters[]: LetterNode → Letter
  │     └── words[]: WordNode  (= foot grouping on this line)
  │           └── syllables[]: SyllableNode → …
  ├── syllables_flat[]: Syllable   (legacy parallel surface)
  └── linkage[]: Linkage           (poem-wide edges)
```

**Pipeline build order** (`lib.rs` / `parse_poem`):

```text
text → normalize → ProsodicUnit stream (via graphemes)
     → Syllable[] (word_scope + syllable_builder)
     → FootPlacement[] (one foot per linguistic word)
     → FootPosition[] → Linkage[] (consecutive feet, may cross lines)
     → PoemNode (build_poem_tree)
     → flat Line[] (prefer linguistic_words)
     → MetreHypothesis[] → optional hybrid reorder
     → ParseFeatureSnapshot, DisplayResult
```

### 2.2 Edge relations (non-containment)

| Relation | From → To | Cardinality | Notes |
|----------|-----------|-------------|-------|
| **talai / linkage** | foot *i* → foot *i+1* | `n_feet − 1` edges | Poem order; may cross line boundaries |
| **cir of last acai** | Foot → `CirAcaiClass` | 0..1 | None if empty foot; else Maa/Vilam (1–2 acai) or Kaai/Kani (3+) from last `SyllableType` |
| **next first acai** | Foot → `SyllableType` | 0..1 | First syllable of next foot |
| **classify_edge** | (`CirAcaiClass`, `SyllableType`) → (`LinkageType`, `LinkageSpecialType`) | total function over 8 cells | Issue #36 table; empty foot → `VenTalai` + `Unknown`, `is_valid=false` |
| **foot pattern** | `[SyllableType]` → `foot_type` string | deterministic | `Ner`/`Nirai` joined by `-` |
| **gold mapping** | anthology `parent_metre` → `MetreType` | partial | Unknown slugs → `None` |
| **ML class index** | `MetreType` → `0..3` | partial | `Other` → no class |

### 2.3 Dual-truth (designed, partially wired)

Portfolio truth channels: **`ml_metre`** vs later **`classical_metre` / violations** — parallel, never silently fused.

| Channel | Shipped today | Future (A02 / D01) |
|---------|---------------|---------------------|
| **ML / heuristic** | `metre_type`, `top_k_metre_hypotheses`, `aggregate_score`, hybrid `metre_probability`, `metre_entropy_bits`, `metre_epistemic_margin` | Explicit `ml_*` field names in schema |
| **Classical** | `classical_violations_for_metre` → always empty; hypotheses may carry empty `violations: Vec<RuleId>` | Real constraints in `classical_checker`; dual ledger |
| **Gold (anthology)** | `parent_metre` on training rows; not a `ParseResult` field | Unchanged; S02 inventory |

**Invariant (portfolio):** do not merge classical violations into hybrid score without a policy. Hybrid head reorders ML/heuristic hypotheses only.

---

## 3. Enum variants (exhaustiveness)

### 3.1 `MetreType` (`metre/mod.rs`)

| Variant | JSON serialize | Deserialize aliases | ML class index |
|---------|----------------|---------------------|----------------|
| `Venpaa` | `"Venpaa"` | (default) | 0 |
| `Aciriyappaa` | `"Aciriyappaa"` | `"Asiriyappaa"` | 1 |
| `Kalippaa` | `"Kalippaa"` | (default) | 2 |
| `Vanjippaa` | `"Vanjippaa"` | (default) | 3 |
| `Other(String)` | string payload | — | *none* |

Heuristic detection emits the **four fixed classes only** (`detect_metre_hypotheses`); `Other` is a wire/extensibility bucket, not a hybrid class.

### 3.2 `LinkageType` (`linkage.rs`)

| Variant | JSON rename | Deserialize aliases |
|---------|-------------|---------------------|
| `VenTalai` | `VenTalai` | `Venthalai` |
| `AciriyaTalai` | `AciriyaTalai` | `Aciriyathalai`, `Aasiriyathalai`, `AsiriyaTalai` |
| `KaliTalai` | `KaliTalai` | `Kalithalai` |
| `VanjiTalai` | `VanjiTalai` | `Vanjithalai` |
| `Other(String)` | open | — |

**Dense histogram** (`parse_features`): bins 0–3 for the four named families; bin 6 = `Other`; length `N_LINKAGE_TYPE = 7` → **bins 4–5 unused / reserved**.

### 3.3 `LinkageSpecialType` (`linkage.rs`)

| Variant (Rust) | JSON rename | Deserialize aliases | Dense bin |
|----------------|-------------|---------------------|-----------|
| `NerondriyaAciriyathalai` | `NerondriyaAciriyaTalai` | `NerondriyaAciriyathalai`, `NerondriyaAasiriyathalai` | 0 |
| `NiraiondriyaAciriyathalai` | `NiraiondriyaAciriyaTalai` | `NiraiondriyaAciriyathalai`, `NiraiondriyaAasiriyathalai` | 1 |
| `IyarcirVenthalai` | `IyarcirVenTalai` | `IyarcirVenthalai` | 2 |
| `VencirVenthalai` | `VencirVenTalai` | `VencirVenthalai` | 3 |
| `Kalithalai` | `KaliTalai` | `Kalithalai` | 4 |
| `OndriyaVanchithalai` | `OndriyaVanjiTalai` | `OndriyaVanchithalai` | 5 |
| `OndrathaVanchithalai` | `OndrathaVanjiTalai` | `OndrathaVanchithalai` | 6 |
| `Unknown` | `Unknown` | (default) | 7 |

Default: `Unknown`.  
**Naming note:** Rust variant names still use historical `…thalai` / `…Vanchi…` stems; **wire keys** prefer `…Talai` / `…Vanji…` (MACHINE_FIRST_SPEC romanization).

### 3.4 Cir × next-acai transition table (issue #36)

| Prev cir (last acai of foot A) | Next first acai | `LinkageType` | `LinkageSpecialType` |
|--------------------------------|-----------------|---------------|----------------------|
| Maa (Ner, ≤2 acai) | Ner | `AciriyaTalai` | `NerondriyaAciriyathalai` |
| Vilam (Nirai, ≤2) | Nirai | `AciriyaTalai` | `NiraiondriyaAciriyathalai` |
| Maa | Nirai | `VenTalai` | `IyarcirVenthalai` |
| Vilam | Ner | `VenTalai` | `IyarcirVenthalai` |
| Kaai (Ner, ≥3) | Ner | `VenTalai` | `VencirVenthalai` |
| Kaai | Nirai | `KaliTalai` | `Kalithalai` |
| Kani (Nirai, ≥3) | Nirai | `VanjiTalai` | `OndriyaVanchithalai` |
| Kani | Ner | `VanjiTalai` | `OndrathaVanchithalai` |

Cir derivation:

- foot length ≤ 2: last Ner → **Maa**, last Nirai → **Vilam**
- foot length ≥ 3: last Ner → **Kaai**, last Nirai → **Kani**

### 3.5 Other closed enums

| Enum | Variants |
|------|----------|
| `SyllableType` | `Ner`, `Nirai` |
| `CirAcaiClass` | `Maa`, `Vilam`, `Kaai`, `Kani` |
| `LetterType` | `Uyir`, `Mei`, `Uyirmei`, `Aaytham` |
| `Vowel` | `A`, `Aa`, `I`, `Ii`, `U`, `Uu`, `E`, `Ee`, `Ai`, `O`, `Oo`, `Au` (12) |
| `Consonant` | `K`, `Ng`, `Ch`, `Nj`, `Tt`, `Nn`, `Th`, `N`, `P`, `M`, `Y`, `R`, `L`, `V`, `Zh`, `Lll`, `Rr`, `Nnn` (18) |
| `ProsodicUnit` | `Vowel`, `Consonant`, `VowelConsonant {…}`, `Aaytham`, `ConsonantCluster(String)` |
| `RuleId` | `MetreLength01`, `LinkageAdjacency01`, `Other(String)` |

---

## 4. Known simplifications & dual surfaces

| Topic | Shipped reality | Target / note (MACHINE_FIRST_SPEC) |
|-------|-----------------|-------------------------------------|
| **Foot ≈ word** | One foot per linguistic word (`line_index` + `word_index_in_line`) | Lattice foot candidates over acai spans |
| **`foot_type` is open string** | `Ner`/`Nirai` pattern; classical names only in `presentation` | Typed `FootPattern` / candidate lattice |
| **Dual word layers** | `linguistic_words` (editor-aligned) vs `words` (foot placements); flat `lines` prefer linguistic words | Avoid silent disagreement between layers |
| **Flat + tree** | `ParseResult` keeps both hierarchical `poem` and flat `syllables`/`feet`/`lines` | Compatibility; tree is source of truth for structure |
| **`line_class`** | Always `"—"` today | Future line-shape ontology |
| **No NerPu / NiraiPu** | Only Ner/Nirai | Spec allows future acai variants |
| **Linkage always “valid” when classifiable** | `is_valid=true` for all 8 table cells; false only if empty/missing | Classical legality later in checker, not table |
| **`Talai` / `TalaiType` aliases** | Type aliases → `Linkage` / `LinkageType` | Migration compatibility |
| **Dense linkage bins 4–5** | Unused among 7 coarse bins | Do not invent meanings without schema bump (S01) |
| **Features ≠ ontology** | dense[51] is derived | S01 semantics contract |
| **special_type vs variation** | Anthology row kinds (S02), not parse enums | Only note: gold uses `parent_metre`; primary train = `special_type` rows |

---

## 5. Exhaustiveness checklist

Use this when adding a variant (must fail CI or bump docs + dense schema).

### 5.1 `MetreType`

- [x] Enum definition `metre/mod.rs`
- [x] Heuristic candidates `prediction.rs` (4 named only)
- [x] ML class map `ml_head.rs` (`metre_type_to_class` / reverse)
- [x] Presentation Tamil names `presentation.rs` `format_metre`
- [x] Gold slug map `poem_variations_training.rs` (`gold_metre_type_for_parent`)
- [x] Serde rename/alias on `Aciriyappaa`
- [x] Unit tests: serde aliases + round-trip (see `metre/mod.rs` ontology tests)
- [ ] Explicit `ml_metre` / `classical_metre` fields on wire (A02 — not yet)
- [ ] Classical constraint matrix per metre (D01 — placeholder only)

### 5.2 `LinkageType`

- [x] Enum + serde renames/aliases
- [x] `classify_edge` exhausts named families
- [x] Dense bin map `parse_features` (`0..3`, `Other→6`)
- [x] Coarse fractions `metre/fractions.rs`
- [x] Presentation fallback when special is `Unknown`
- [x] Table unit tests in `linkage.rs`
- [x] Serde lock tests (canonical serialize + legacy deserialize)

### 5.3 `LinkageSpecialType`

- [x] Eight variants including `Unknown`
- [x] Full #36 table coverage in `classify_edge`
- [x] Dense bins `0..7`
- [x] Presentation Tamil strings for all named specials
- [x] Serde rename/alias pairs
- [x] Table + serde tests in `linkage.rs`

### 5.4 `CirAcaiClass` / `SyllableType`

- [x] Cir from foot length × last acai
- [x] SyllableType used in foot_pattern and cir
- [x] Exhaustive match in `classify_edge` (8 arms)
- [x] Ontology unit tests lock variant set

### 5.5 Structure

- [x] Poem → Line → Word/Foot → Syllable → Letter in `poem_tree`
- [x] Linkage edges on consecutive feet
- [x] `parse_poem` stage order documented above
- [ ] Typed lattice `FootCandidate` / `LinkageCandidate` (spec target, not shipped)

---

## 6. Module index (absolute paths under crate)

| Path | Ontology responsibility |
|------|-------------------------|
| `/tamil-seiyul-alagi/src/poem_tree.rs` | Hierarchy + traits |
| `/tamil-seiyul-alagi/src/types.rs` | `ParseResult`, `Line`, `MetreHypothesis`, schema version |
| `/tamil-seiyul-alagi/src/syllable.rs` | `Syllable`, `SyllableType` |
| `/tamil-seiyul-alagi/src/syllable_builder.rs` | Ner/Nirai assignment |
| `/tamil-seiyul-alagi/src/word_scope.rs` | Linguistic word segmentation → syllables |
| `/tamil-seiyul-alagi/src/foot.rs` | Foot grouping |
| `/tamil-seiyul-alagi/src/foot_pattern.rs` | Pattern strings |
| `/tamil-seiyul-alagi/src/letter.rs` | Letters from syllable text |
| `/tamil-seiyul-alagi/src/prosodic_unit.rs` | Vowel/Consonant/Uyirmei units |
| `/tamil-seiyul-alagi/src/linkage.rs` | Cir, LinkageType, LinkageSpecialType, edges |
| `/tamil-seiyul-alagi/src/metre/mod.rs` | `MetreType` |
| `/tamil-seiyul-alagi/src/metre/prediction.rs` | Heuristic hypotheses |
| `/tamil-seiyul-alagi/src/metre/ml_head.rs` | Hybrid ML head (4-way) |
| `/tamil-seiyul-alagi/src/metre/classical_checker.rs` | Classical channel placeholder |
| `/tamil-seiyul-alagi/src/parse_features.rs` | Dense observables (not primitives) |
| `/tamil-seiyul-alagi/src/presentation.rs` | Display mapping only |
| `/tamil-seiyul-alagi/src/lib.rs` | Pipeline assembly |
| `/tamil-seiyul-alagi/src/ontology_map.rs` | Public catalog ids + enum exhaustiveness tests |

---

## 7. Open questions for thumpi (architecture / ML portfolio)

1. **Wire dual-truth names:** When A02 lands, should `ParseResult` grow explicit `ml_metre` / `classical_metre` fields, or keep `metre_type` as ML winner with classical only in a parallel bag?
2. **`MetreType::Other`:** Keep as open wire escape, or forbid in training/gold and treat as parse error?
3. **Dense bins 4–5 (coarse linkage):** Reserve for future families, collapse dim to 5, or document permanent padding?
4. **Rust vs JSON special names:** Align Rust variant identifiers to wire (`…VenTalai`, `…Vanji…`) in a rename pass, or keep historical identifiers forever with serde renames?
5. **`line_class` ontology:** Spec/line-shape types needed before classical Venpaa ettai/adi rules, or derived only inside classical_checker?
6. **Foot lattice timing:** Should S03 ledger pin “foot≈word” as ontology version 1, with lattice as version 2 breaking change?
7. **RuleId registry:** Portfolio/MACHINE_FIRST_SPEC want typed rule IDs; today only two named + `Other(String)` — expand before or after classical_checker?
8. **Anthology slug `aciriyappa` (one *a*):** Intentional short form vs wire `Aciriyappaa` — document as semantics (S01) alias table only?

---

## 8. Artifact provenance

| Field | Value |
|-------|--------|
| Step | `S00_ontology_map` |
| Worktree agent | theni / measure |
| Code pin | Inventory of `tamil-seiyul-alagi/src` as of 2026-07-27 |
| Catalog version | `ONTOLOGY_MAP_VERSION = 1` |
| Decision | **ADOPT** — see `step_S00_ontology_map/decision.md` |
| Primary metric pin | `special_type` top-1 = 1.0 (17/17); variation stress 0.158 (3/19) |
| Follow-ons | S01 semantics contract; S02 anthology inventory; S03 SOA ledger |
