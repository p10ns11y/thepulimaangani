# Metre ML methods portfolio — patterns before classical

**Status:** living research contract for issue [#36](https://github.com/p10ns11y/thepulimaangani/issues/36)  
**Date:** 2026-07-27  
**Goal:** Discover and freeze **what ML believes** about coarse Tamil metre *before* implementing classical rule-based metre analysis, so later comparison is scientific (not retrospective storytelling).

**Related:** [`METRE_PREDICTION.md`](METRE_PREDICTION.md) · [`TRAINING_PROCESS.md`](TRAINING_PROCESS.md) · [`PARSE_FEATURES.md`](PARSE_FEATURES.md) · [`MACHINE_FIRST_SPEC.md`](MACHINE_FIRST_SPEC.md) · `classical_checker.rs` (placeholder, intentionally dark)

**External maps:**

- [scikit-learn Choosing the right estimator](https://scikit-learn.org/stable/machine_learning_map.html)
- Control-engineering signal filter (Brian Douglas via [@Peramanathan](https://x.com/Peramanathan/status/2080311438133043594)): treat estimation vs constraints as **separated** plant/observer/controller concerns

---

## 1. North star

| Do | Do not |
|----|--------|
| ML as a **pattern microscope** | ML as a silent stand-in for classical truth |
| Export inspectable beliefs (coeffs, motifs, disagreements) | Merge classical violations into hybrid score without a policy |
| Measure every method against a frozen baseline | Ship models without ablation / calibration honesty |
| Keep `special_type` as primary gold; `variation` as stress | Bulk-train on noisy variation rows |
| Classical later as **orthogonal** judge | Double-count classical into the same integer score |

**Pipeline identity (already shipped):**

```text
poem text → units → syllables → feet → linkage → dense[51]
         → heuristic hypotheses → optional hybrid logit
         → top_k + entropy/margin
         → classical_checker (empty; stays empty until Tier A–C evidence is frozen)
```

Live preview **debounce** is UX rate-limiting only — not a second architecture path.

### Cross-cutting pillars (every workflow run)

| Pillar | Meaning in this project | Must stay consistent with |
|--------|-------------------------|---------------------------|
| **Ontology** | Typed entities & relations: Poem → Line → Foot → Syllable → Letter; `MetreType`; coarse `LinkageType` vs special bond; cir classes (Maa/Vilam/Kaai/Kani); Ner/Nirai | `types.rs`, `poem_tree.rs`, `linkage.rs`, `metre/mod.rs`, OpenAPI wire, study materials |
| **Semantics** | What each symbol *means* in measurement: `dense[j]` formulas, score scales (heuristic int vs hybrid probability), gold label meaning (`parent_metre`, `special_type` vs `variation`), serde aliases, Tamil presentation vs machine keys | [`PARSE_FEATURES.md`](PARSE_FEATURES.md), [`METRE_PREDICTION.md`](METRE_PREDICTION.md), [`CANONICAL_JSON_TRAVERSAL.md`](CANONICAL_JSON_TRAVERSAL.md) |
| **Anthology** | Curated multi-poem corpus & splits used as evidence: `poem_variations` tables / `data/poem_variations.js`, `special_type` (primary gold), `variation` (stress only), training CSV/JSONL, golden kural fixture | `poem_variations.rs`, `poem_variations_training.rs`, `data/training/` |

**Invariant:** No ML step may invent a new ontology term, relabel dense semantics, or train on anthology rows outside the declared split without a schema/docs bump and re-baseline.

---

## 2. Problem shapes

| Problem | Observables | Labels | Notes |
|---------|-------------|--------|-------|
| Coarse metre class | `dense[51]`, linkage fractions | `parent_metre` (4-way) | Primary target |
| Ranking / uncertainty | scores, entropy, margin | same | Hybrid softmax when active |
| Linkage / talai family | edge table, cir types | #36 special table | Rules + discovery |
| Scansion alternatives | unit stream, vikalpa | weak | Sequence models later |
| Outlier / bad parse | dense + high entropy | weak / none | Semi-supervised |
| ML vs classical (future) | features + violations | dual truth | Two-truth protocol |

**Sklearn-map path for this repo:** labeled categories, **N ≪ 100k** (tens–hundreds), engineered features → **linear / logistic first**, then k-NN, then trees/kernel; **not** raw-text TF-IDF or deep nets first.

---

## 3. Method catalogue by domain

### 3.1 Sklearn-family estimators

| Method | Tier | Role |
|--------|------|------|
| Multinomial logistic / hybrid logit | A | Shipped + pure-dense baseline |
| Linear SVM | A | Second linear ceiling |
| k-NN / class prototypes | A | Interpretable “looks like mean Venpaa” |
| Probability calibration (Platt / isotonic) | A | Honest `metre_probability` |
| PCA / SVD | A | Variance directions (example exists) |
| LDA (supervised) | A | Separation directions clearer than PCA |
| Mutual information feature↔metre | A | Rank informative `dense_j` |
| Random Forest / ExtraTrees / GBDT | B | Offline importances → distill rules |
| Kernel SVM (RBF) | B | Nonlinear ceiling only |
| Naive Bayes on count-like bins | B | Sanity baseline |
| GMM / k-means / hierarchical clustering | B | Recover metres without labels? |
| DBSCAN / HDBSCAN | B | Density outliers |
| NMF | B | Parts-based non-negative factors |
| t-SNE / UMAP | B | Viz only |
| Metric learning (LMNN, contrastive) | C | When N grows |
| Ordinal / rank models | B | Continuous “Venpaa-likeness” |
| SGD / online logistic | B | Streaming refit |

### 3.2 Sequence & structured prediction

| Method | Tier | Role |
|--------|------|------|
| HMM / HSMM on Ner/Nirai | B | Scansion as hidden state |
| CRF / structured SVM | B | Joint labels + feature templates |
| Finite-state transducers | C→classical bridge | Legality; soft scores stay ML |
| Viterbi / beam over scansion lattice | B | `alt_scansion` / foot lattice |
| PCFG / grammar of line shapes | C | Rare; catalogue-driven |
| 1D CNN / small Transformer on units | C | Only after dense baselines + more labels |

### 3.3 Control theory & dynamical systems

| Concept | Project analogue | Methods |
|---------|------------------|---------|
| Plant | Linguistic process + parse stages | Structure ID from measurements |
| Sensors | `parse_features`, linkage histograms | Sensor fusion = channel weights |
| State | 4-way metre belief; scansion path | Bayesian / HMM belief |
| Observer | Hybrid head | Estimation only |
| Feedback | Live debounce, re-parse | Rate limit (UX control) |
| Reference | Gold `parent_metre` | Tracking error = confusion |
| Noise | Variation lines, short poems | Robust eval, bootstrap |
| Separation principle | ML ⟂ classical | **Hard rule** until dual harness |
| Identification | Weight fit, PCA, prototypes | Re-ID after schema change |
| Sensitivity | ∂score/∂dense_j | Ablation / gain analysis |
| Stability | Schema + weight pins | No silent plant drift |

**High ROI control toolkit:** line-by-line Bayesian update, sensitivity/ablation, Monte Carlo robustness (exists), later set-membership for classical “cannot be Venpaa.”  
**Low ROI:** full LQR/MPC on poems (metaphor only unless research notes demand it).

### 3.4 Statistics, information, decision theory

| Method | Tier | Role |
|--------|------|------|
| Confusion, top-1, MRR, top-2 | A | Primary metrics (MC exists) |
| Entropy / epistemic margin | A | Honesty + disagreement flags |
| Bootstrap / LOO / stratified CV | A | Tiny-N intervals |
| Reliability diagrams | A | Calibration |
| Chi-square / Fisher on linkage×metre | A | Discrete bond tables |
| Cost-sensitive decision curves | B | Learner-facing error costs |
| Head A/B protocol | A | Scientific comparison of estimators |

### 3.5 Data mining & knowledge discovery

| Method | Tier | Role |
|--------|------|------|
| Association rules (Apriori/FP) | A | Human-readable itemsets ⇒ metre |
| Frequent sequence mining (Ner/Nirai) | A | Motif candidates for classical later |
| Contrast-set / emerging patterns | A | Venpaa vs Aciriyappaa differentiators |
| Subgroup discovery on errors | A | Why ML fails |
| Isolation forest / anomaly | B | Suspect gold or parse |
| Partial dependence / interactions | B | From trees offline |
| Biclustering | D | Speculative |

### 3.6 Graph, combinatorial, optimization

| Method | Tier | Role |
|--------|------|------|
| Feet-as-nodes, talai-as-edges | B | Motif features |
| Graph kernels / WL features | B | Extra dense channels |
| Edit distance / DTW on acai | B | Poem similarity |
| EMD on linkage histograms | B | Soft profile distance |
| ILP / SAT / CP for classical | C–D | ML proposes, solver verifies (**later**) |

### 3.7 Causal / scientific ML protocol

| Method | Tier | Role |
|--------|------|------|
| Ablation / lesion of feature blocks | A | Importance inside the model |
| Counterfactual feature flips | A | Flip bond mass → watch prediction |
| Two-truth ledger | A (design) | `ml_metre` vs later `classical_*` |
| Disagreement mining | A | Core research product |
| Active learning (high entropy) | C | Grow labels efficiently |

### 3.8 Explicitly deferred / low ROI (Tier D)

- Deep RL “edit toward Venpaa”
- Generative LLM as primary metre classifier (label assist only)
- Heavy MPC/LQR
- Raw-text deep learning before structure baselines
- Training bulk on all variation rows without relabel

---

## 4. Tier definitions (implementation contract)

### Tier A — do / double down (high ROI)

1. Linear / logistic / hybrid + **coefficient & sensitivity reports**
2. Prototypes / k-NN on standardized `dense`
3. LDA + PCA (supervised vs unsupervised)
4. Mutual information + association / sequence mining
5. Calibration + bootstrap uncertainty
6. Control-style separation: estimator ⟂ constraints (docs + harness stubs)
7. Ablation / counterfactual flips
8. Frozen baseline report (MC + hybrid + PCA + linkage vs gold)
9. Disagreement set (ML ≠ `parent_metre`) with feature reasons
10. Pattern cards per metre (top features + typical linkage mass)

### Tier B — strong research tools (offline first, embed selectively)

1. RF/GBM importances → distilled human rules
2. GMM / hierarchical clusters vs gold
3. HMM/CRF sketches on unit/scansion sequences
4. Graph motifs on foot–talai graphs
5. Kernel SVM / NB ceilings
6. Ordinal “likeness” scores
7. Anomaly detection for bad rows

### Tier C — later or more data

1. Metric learning, active learning
2. Small CNN/Transformer on unit stream
3. FST / grammar bridge scaffolding (still not full classical)
4. Bayesian hierarchical models over poets/subtypes
5. Line-belief Bayesian filter productization

### Tier D — metaphor / low ROI / classical dual

1. Full classical verifier (only after A–B pattern freeze)
2. ILP/SAT classical backend
3. RL / generative classifiers
4. Speculative mining (biclustering, etc.) if residual value remains

**Classical rule-based metre remains out of band until Tier A (and preferably B pattern mining) produces a dated ledger.**

---

## 5. Progressive step order (canonical sequence)

Each **step** is one atomic method introduction. Order is fixed so **semantics / ontology / anthology foundations** land first, then ML tiers, classical last.

### 5.0 Foundation steps (SOA — always first)

| Step ID | Pillar | Method | Depends on |
|---------|--------|--------|------------|
| `S00_ontology_map` | Ontology | Machine-readable entity graph: Poem/Line/Foot/Syllable/Letter, MetreType (4+Other), LinkageType, LinkageSpecialType (#36 table), cir classes; relations used by parse + ML | code + MACHINE_FIRST_SPEC |
| `S01_semantics_contract` | Semantics | Dense index glossary tests, score-scale docs, gold-label meaning, serde alias table, presentation vs machine keys; forbid silent meaning drift | S00, PARSE_FEATURES |
| `S02_anthology_inventory` | Anthology | Inventory special_type vs variation counts; export freshness; per-metre balance; forbidden training uses; golden fixture links | S01 |
| `S03_soa_ledger` | All three | Single `data/training/reports/soa_ledger.md` + JSON: ontology version, semantics schema ids, anthology fingerprint | S00–S02 |

### 5.1 Method steps (Tier A–D)

| Step ID | Tier | Method | Depends on |
|---------|------|--------|------------|
| `A00_baseline_freeze` | A | Snapshot MC + hybrid + PCA + linkage_vs_gold → dated artifact | S03 |
| `A01_eval_harness` | A | Unified metrics API (top-1, MRR, top-2, confusion, bootstrap CI) | A00 |
| `A02_two_truth_schema` | A | Schema/docs for `ml_*` fields; classical slots empty; ontology dual-truth nodes | A01, S00 |
| `A03_pure_dense_logistic` | A | Pure dense multinomial logit head (offline + optional embed) | A01 |
| `A04_prototypes_knn` | A | Class means + k-NN | A01 |
| `A05_lda_pca_reports` | A | LDA + PCA loadings reports | A00 |
| `A06_mi_and_chi2` | A | MI ranking + chi-square linkage×metre | A01 |
| `A07_calibration` | A | Reliability + recalibration of probabilities | A03 or hybrid |
| `A08_association_rules` | A | Discrete itemset rules ⇒ metre | A06 |
| `A09_sequence_motifs` | A | Frequent Ner/Nirai motifs | A08 |
| `A10_ablation` | A | Block lesions (global / linkage / foot / line) | A03–A04 |
| `A11_counterfactuals` | A | Feature flip experiments | A10 |
| `A12_pattern_cards` | A | Per-metre cards + disagreement set | A05–A11 |
| `A13_head_ab` | A | A/B table: heuristic vs hybrid vs logistic vs k-NN | A03–A04 |
| `B01_tree_importances` | B | RF/GBM offline importances | A13 |
| `B02_clustering` | B | k-means/GMM/hierarchical vs gold | A01 |
| `B03_anomaly` | B | Isolation / density outliers | B02 |
| `B04_kernel_nb_ceilings` | B | RBF-SVM + NB ceilings | A13 |
| `B05_hmm_crf_sketch` | B | Sequence model research module (no product default) | A09 |
| `B06_graph_motifs` | B | Foot–talai graph features | A09 |
| `B07_dtw_emd` | B | Sequence / histogram distances | B06 |
| `B08_ordinal_likeness` | B | Continuous likeness scores | A07 |
| `C01_active_learning` | C | Entropy-query label growth plan | A13 |
| `C02_metric_learning` | C | If N justifies | C01 |
| `C03_cnn_transformer_pilot` | C | Only if dense heads plateau | A13, more labels |
| `C04_bayesian_line_filter` | C | Line-by-line belief update | A07 |
| `C05_fst_scaffold` | C | FST/grammar scaffold (no full classical) | A12 |
| `D01_classical_violations` | D | Implement `classical_checker` against MACHINE_FIRST_SPEC | A12 frozen |
| `D02_ilp_sat_backend` | D | Optional solver backend | D01 |
| `D03_dual_compare_report` | D | ML vs classical dual ledger + product policy | D01 |

Workflow **must not** start `D01` until `A12` artifacts exist and are dated.  
Workflow **must not** start `A00` until `S03` SOA ledger exists (or this run completes S00–S03 first).

---

## 5.2 Semantics · Ontology · Anthology (deep contract)

### Ontology (what exists)

| Layer | Entities | Relations / constraints |
|-------|----------|-------------------------|
| Structure | Poem, Line, Word/Foot, Syllable (அசை), Letter/unit | Hierarchical containment; foot≈word today (scope note) |
| Prosodic class | Ner, Nirai | Assigned by syllable builder |
| Cir (சீர் class) | Maa, Vilam, Kaai, Kani | From acai count; inputs to #36 talai table |
| Linkage | Coarse `*Talai` + special bond name | Edge between consecutive feet; positions |
| Metre | Venpaa, Aciriyappaa, Kalippaa, Vanjippaa, Other | Coarse prediction target |
| Truth channels | `ml_metre`, later `classical_metre` / violations | Parallel; never silently fused |
| Features | `ParseFeatureSnapshot` dense[51] | Derived observables, not ontology primitives |

**Ontology work products:** `ontology_map.md` + optional Rust module comments / schema enum exhaustiveness tests.

### Semantics (what symbols mean)

| Symbol family | Semantic rules |
|---------------|----------------|
| `dense[0..51)` | Exact formulas in PARSE_FEATURES; schema_version pins meaning |
| `aggregate_score` pre-hybrid | Arbitrary integer scale; not a probability |
| `metre_probability` post-hybrid | Softmax mass; needs calibration step for honesty |
| `parent_metre` gold | Coarse label from anthology tree; maps to `MetreType` |
| `special_type` vs `variation` | Primary supervision vs stress/adversarial |
| JSON keys | Machine Latin keys (`VenTalai`, `Aciriyappaa`); Tamil in `presentation` |
| Serde aliases | Legacy spellings deserialize only; new writes use canonical |

**Semantics work products:** contract tests that fail if dense layout or gold mapping drifts; glossary in SOA ledger.

### Anthology (what evidence we trust)

| Slice | Role | Training? |
|-------|------|-----------|
| `special_type` rows | Primary gold for adopt metrics | Yes |
| `variation` rows | Stress / disagreement / poisoning risk | Report only unless relabeled |
| Kural golden fixture | Parse-feature regression | Not a multi-class train set |
| Future external poems | Growth via active learning (Tier C) | Only after inventory + label policy |

**Anthology work products:** inventory JSON (counts per metre, per kind), fingerprint of corpus source, export paths.

### How every ML step uses SOA

1. **Tests** assert ontology enum coverage and semantic invariants before new code.  
2. **Implementation** only reads anthology splits declared for that step.  
3. **Measure** reports metrics **and** SOA deltas (new terms? schema bump? corpus fingerprint change?).  
4. **ADOPT** requires no unapproved SOA drift.

---

## 6. Test-first protocol (every step)

### 6.1 Gate order (hard)

```text
1. Spec & metrics contract (what “improve” means)
2. Tests written FIRST (must fail or be skipped-red on missing API)
3. Minimal implementation
4. Tests green
5. Measure vs baseline on special_type (+ variation stress separate)
6. Decision: ADOPT | REJECT | DEFER
7. Update ledger + baseline if ADOPT
8. Only then next step
```

### 6.2 Test kinds (pick best fit; prefer lower cost that still binds)

| Kind | When | Examples |
|------|------|----------|
| **Unit** | Pure functions (metrics, MI, k-NN distance, calibration) | `#[test]` in `metre/` / new `ml_eval` module |
| **Property / invariant** | Schema lengths, softmax sum≈1, histogram non-neg | schema_version, dense len 51 |
| **Golden / fixture** | Stable vectors | `kural_venpaa_parse_features.json` |
| **Integration** | Export → eval → report path | cargo examples + parse_poem |
| **Monte Carlo regression** | Ordering robustness | existing MC floor tests |
| **Mutation** | Critical metric code | cargo-mutants or targeted assert flips on CI optional |
| **Performance** | Head latency / alloc | criterion or simple bench on dense classify; WASM path not regressed |
| **Snapshot** | Pattern cards / reports | committed or generated under `data/training/reports/` |

### 6.3 Improvement definition (measurable)

On **`special_type`** rows (primary):

| Metric | Prefer |
|--------|--------|
| Top-1 accuracy | Higher |
| MRR / correct@2 | Higher |
| Bootstrap CI lower bound | Prefer non-overlapping improvement |
| Mean entropy on **correct** | Not required lower; track |
| Mean entropy on **incorrect** | Higher is often better (honest uncertainty) |
| Calibration ECE | Lower |
| Ablation: critical blocks | Non-zero drop when lesioned (sanity) |

On **`variation`** rows: report separately; never sole adopt criterion.

**ADOPT** if: primary metric improves with non-collapsed uncertainty honesty **or** interpretability artifact is the goal (mining steps) and does not **degrade** top-1 beyond a declared tolerance (default: no more than −2 percentage points unless user overrides).

**REJECT** if: no gain on primary metrics **and** no unique interpretability value, or schema/tests break.

**DEFER** if: blocked on data volume or dependency step.

### 6.4 Commands agents must run (repo conventions)

```bash
# Rust crate
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example metre_monte_carlo_report
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example fit_metre_hybrid_weights
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example parse_features_pca_metre
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example training_linkage_vs_gold
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example export_poem_variations_training_csv
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example export_poem_variations_training_jsonl

# Frontend only if TS/WASM surface changes
pnpm run precommit   # day-to-day
pnpm run gate        # when Rust/WASM/deps change
```

---

## 7. Artifact layout

```text
data/training/
  poem_variations_training.csv          # regenerate via example
  poem_variations_training.jsonl
  reports/
    soa_ledger.md                       # S03: ontology + semantics + anthology
    soa_ledger.json
    ontology_map.md                     # S00
    semantics_contract.md               # S01
    anthology_inventory.md              # S02
    baseline_YYYYMMDD.md                # A00
    step_<STEP_ID>/
      metrics.json
      decision.md                       # ADOPT|REJECT|DEFER + rationale
      pattern_notes.md
      tests_added.md
      soa_delta.md                      # any ontology/semantics/anthology change
tamil-seiyul-alagi/src/metre/           # production heads
tamil-seiyul-alagi/src/ml_eval/         # optional eval-only helpers (preferred for research)
tamil-seiyul-alagi/examples/            # CLI reports
```

Bump `PARSE_FEATURE_SCHEMA_VERSION` / `METRE_ML_WEIGHT_SCHEMA` when layouts change; refit weights; refresh goldens; update SOA ledger fingerprint.

---

## 8. Control-system diagram (with SOA)

```text
Anthology (corpus splits, gold labels)
        │
        ▼
Text ──► [plant: normalize → units → syllables → feet → talai]  ← Ontology structure
              │
              ▼
         dense[51] + linkage            ← Semantics of sensors
              │
     ┌────────┼────────────────┐
     ▼        ▼                ▼
  Heuristic  Logistic/hybrid  Mining (MI, rules, motifs)
  priors     k-NN / LDA       clusters / sequences
     │        │                │
     └────────┴───────┬────────┘
                      ▼
             ML beliefs + pattern ledger  (still under SOA)
                      │
                      ▼  (Tier D only; orthogonal)
             Classical FST / CP / ILP verifier
                      │
                      ▼
             Dual report: agree | ML-only | classical-only
```

---

## 9. Workflow entrypoint

Progressive implementation is orchestrated by:

**`.grok/workflows/metre-ml-tier-progression.rhai`**

| Arg | Meaning |
|-----|---------|
| `start_step` | Index into full step list including S00… (default `0` = `S00_ontology_map`) |
| `max_steps` | Steps this run (default `1`) |
| `skip_user_gates` | If true, do not pause between steps |
| `force_step_id` | Optional single step id override |
| `allow_classical` | Must be true to enter Tier D steps |
| `require_soa` | Default true: refuse A\* if S03 missing unless completing S\* this run |

Each step: **SOA check → tests → implement → measure → decision → ledger**.

Agents always re-read `METRE_ML_METHODS_PORTFOLIO.md` and existing SOA artifacts before editing code.

---

## 10. Done criteria for “ML first” phase

Stop classical implementation until:

1. **SOA ledger** (S03) exists and is current  
2. Dated **baseline** report exists  
3. At least **two** non-heuristic heads evaluated (e.g. pure logistic + k-NN)  
4. **Pattern cards** + **disagreement set** committed  
5. **A/B head table** with bootstrap-aware notes  
6. Two-truth schema documented (classical fields still empty)

Then Tier D may begin with eyes open.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-27 | Initial portfolio: tiers A–D, step order, TDD protocol, control + mining catalogue |
| 2026-07-27 | Add **semantics · ontology · anthology** pillars, foundation steps S00–S03, SOA ledger, workflow args |
