# Metre-ML tier progression — run summary

**Date:** 2026-07-27  
**Workflow:** `metre-ml-tier-progression` (SOA foundation block S00–S03)  
**Portfolio:** [`tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md`](../../../tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md) §5.0 / §5.2 / §9  
**Status:** **ADOPT** (foundation complete)  
**step_id:** `run_summary`

---

## 1. Steps attempted

| Index | step_id | Pillar | Decision | improved | soa_ok | Notes |
|------:|---------|--------|----------|:--------:|:------:|-------|
| 0 | `S00_ontology_map` | ontology | **ADOPT** | true* | true | Entity graph + `ONTOLOGY_MAP_VERSION=1` + enum exhaustiveness; no scoring head change |
| 1 | `S01_semantics_contract` | semantics | **ADOPT** | true* | true | Dense glossary / gold labels / aliases freeze; `SEMANTICS_CONTRACT_VERSION=1`; delta_pp=0 |
| 2 | `S02_anthology_inventory` | anthology | **ADOPT** | true* | true | Counts, balance, export fingerprints, forbidden uses, kural role; N=17/19/36 |
| 3 | `S03_soa_ledger` | soa-all | **ADOPT** | true* | true | Composite ledger `soa_ledger.md` + `.json` + pin module; schema fingerprint locked |

\* `improved=true` means **SOA-foundation / interpretability value**, not a measured scoring gain. Primary `special_type` top-1 stayed **1.0** on all four steps (no damage).

**REJECT / DEFER this run:** none.

Step packs:

- [`step_S00_ontology_map/`](step_S00_ontology_map/) — `decision.md`, `metrics.json`, `soa_delta.md`, `tests_added.md`
- [`step_S01_semantics_contract/`](step_S01_semantics_contract/)
- [`step_S02_anthology_inventory/`](step_S02_anthology_inventory/)
- [`step_S03_soa_ledger/`](step_S03_soa_ledger/)

---

## 2. SOA status

| Check | Result |
|-------|--------|
| Ontology map | **Present** — [`ontology_map.md`](ontology_map.md); `ONTOLOGY_MAP_VERSION=1` |
| Semantics contract | **Present** — [`semantics_contract.md`](semantics_contract.md); `SEMANTICS_CONTRACT_VERSION=1` |
| Anthology inventory | **Present** — [`anthology_inventory.md`](anthology_inventory.md) + [`.json`](anthology_inventory.json); `ANTHOLOGY_INVENTORY_VERSION=1` |
| SOA ledger | **Present** — [`soa_ledger.md`](soa_ledger.md) + [`.json`](soa_ledger.json); `SOA_LEDGER_VERSION=1` |
| Schema fingerprint | `soa=1;ont=1;sem=1;anth=1;dense_schema=1;dense_len=51;parse_result=1;ml_weight=3` |
| `require_soa` gate | **Satisfied** — Tier A may start |
| Classical checker | **Empty** (pre-D01); dual-truth channels parallel, never fused |

**soa_ok:** `true` (ledger written and constituent freezes ADOPT).

---

## 3. Baseline status

| Item | Status |
|------|--------|
| Dated baseline freeze (`A00_baseline_freeze`) | **Not started** |
| MC / hybrid / PCA / linkage_vs_gold snapshot artifact | **Pending A00** (measure stack already green under S03; needs dated A00 freeze) |
| Eval harness (`A01`) | Blocked on A00 |
| Pattern cards (`A12`) | Not started |
| Classical Tier D (`D01+`) | **Blocked** — needs A12 freeze **and** `allow_classical=true` |

**Primary metrics (stable across S00–S03):**

| Slice | top-1 | MRR | MC |
|-------|------:|----:|----|
| special_type (primary, N=17) | **1.000** | **1.000** | 340/340 |
| variation (stress, N=19) | **0.158** | **0.496** | 60/380 |
| all rows (stress-inclusive) | **0.556** | **0.734** | 400/720 |

Inventory freeze: **17** primary / **19** stress / **36** total  
(venpaa 10/6, aciriyappa 3/5, kalippaa 2/5, vanjippaa 2/3).

---

## 4. Recommended next step

| Field | Value |
|-------|-------|
| **start_step** | **4** |
| **step_id** | **`A00_baseline_freeze`** |
| Depends on | S03 ledger (satisfied) |
| Purpose | Snapshot MC + hybrid + PCA + linkage_vs_gold → **dated** baseline artifact under SOA ledger |

### Workflow args (suggested)

```text
start_step = 4
# force_step_id = "A00_baseline_freeze"   # optional single-step override
max_steps = 1
require_soa = true
allow_classical = false                   # keep false until A12 frozen
```

### Reminders

1. **Classical (Tier D):** do **not** start `D01_classical_violations` until:
   - `A12_pattern_cards` artifacts exist and are dated, **and**
   - workflow arg **`allow_classical=true`**.
2. **Baseline before heads:** finish A00 before treating later A\* scoring experiments as comparable.
3. **Ledger bump:** regenerate `soa_ledger` if any of ont/sem/anth versions or corpus fingerprints change.
4. Hybrid fit may rewrite comments only; numeric weights remain train/LOOCV 1.0 until an explicit weight-change step ADOPTs otherwise.

---

## 5. Decision rollup (verified against step packs)

Untrusted session decisions JSON was checked against each `step_*/decision.md` + `metrics.json` and the live SOA ledger:

| step_id | File status | Session claim | Match |
|---------|-------------|---------------|:-----:|
| S00_ontology_map | ADOPT | ADOPT | yes |
| S01_semantics_contract | ADOPT | ADOPT | yes |
| S02_anthology_inventory | ADOPT | ADOPT | yes |
| S03_soa_ledger | ADOPT | ADOPT | yes |

All four are pure foundation / interpretability ADOPTs with **no scoring damage** and **soa_ok=true**.

---

## 6. This summary

| Field | Value |
|-------|-------|
| done | true |
| step_id | `run_summary` |
| status | **ADOPT** |
| improved | false (synthesis only; no new measure) |
| soa_ok | true |
| metrics_summary | S00–S03 all ADOPT; special_type top-1=1.0; next A00 @ index 4 |
| next | `start_step=4` → `A00_baseline_freeze` |
