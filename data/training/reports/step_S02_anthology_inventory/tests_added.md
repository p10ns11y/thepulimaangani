# S02_anthology_inventory — tests added

**Step:** `S02_anthology_inventory`  
**Phase:** **measure** (ADOPT)  
**Date:** 2026-07-27  
**status:** `ADOPT`  
**improved:** `true` (SOA-foundation value)  
**soa_ok:** `true`

## Intent

Lock the Anthology pillar before S03 ledger / Tier A method work:

- Exact `special_type` (17) vs `variation` (19) vs total (36)  
- Per-metre block balance (venpaa 10/6, aciriyappa 3/5, kalippaa 2/5, vanjippaa 2/3)  
- Primary gold isolation (`special_type`); `variation` stress-only  
- Export paths (CSV / JSONL / JS mirror) + golden kural fixture path + role  
- Forbidden training uses (machine ids)  
- MC special_type surface (17×20 = 340)  
- Label note: `sinthadi_aciriyappaa` → `parent_metre=vanjippaa`  
- Live `poem_variation_*` rows must match inventory pins  

## Paths

| Path | Role | Status |
|------|------|--------|
| [`tamil-seiyul-alagi/tests/test_anthology_inventory_s02.rs`](../../../../tamil-seiyul-alagi/tests/test_anthology_inventory_s02.rs) | Integration contract | **Green** (10/10) |
| [`tamil-seiyul-alagi/src/anthology_inventory.rs`](../../../../tamil-seiyul-alagi/src/anthology_inventory.rs) | Public pins + unit tests | **Green** (9/9) |
| [`tamil-seiyul-alagi/src/lib.rs`](../../../../tamil-seiyul-alagi/src/lib.rs) | `pub mod` + crate-root re-exports | Wired |
| [`data/training/reports/anthology_inventory.md`](../anthology_inventory.md) | Human inventory freeze | Aligned |
| [`data/training/reports/anthology_inventory.json`](../anthology_inventory.json) | Machine counts twin | Aligned + fingerprints refreshed |

## Integration tests (`test_anthology_inventory_s02`)

| Test | Kind | Asserts |
|------|------|---------|
| `s02_anthology_inventory_version_is_positive` | unit-style pin | version ≥ 1 |
| `s02_totals_special_type_primary_variation_stress` | invariant | 36 = 17 + 19; row_kind pins |
| `s02_per_metre_block_counts_match_inventory` | ontology/coverage | block table + sums |
| `s02_class_balance_special_type_only` | anthology primary | special-only balance; gold slugs |
| `s02_export_and_golden_paths_are_stable` | golden / paths | CSV, JSONL, JS, kural path + role |
| `s02_forbidden_training_use_ids_cover_policy` | policy catalog | ≥10 forbidden-use ids |
| `s02_mc_special_type_eval_count_is_seventeen_times_iters` | MC regression pin | 340 @ 20 iters |
| `s02_sinthadi_aciriyappaa_parent_is_vanjippaa` | label invariant | parent vanjippaa |
| `s02_live_rows_match_inventory_and_isolate_special_type` | integration | live rows ≡ pins; special isolation |
| `s02_kural_fixture_schema_pins_unchanged` | semantics consumer | schema 1 / dense 51; path suffix |

## Measure commands (portfolio §6.4)

```bash
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml --lib anthology_inventory
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml --test test_anthology_inventory_s02
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example metre_monte_carlo_report
MC_ROW_KINDS=variation cargo run --example metre_monte_carlo_report
MC_ROW_KINDS=all cargo run --example metre_monte_carlo_report
cargo run --example fit_metre_hybrid_weights
cargo run --example parse_features_pca_metre
cargo run --example training_linkage_vs_gold
cargo run --example export_poem_variations_training_csv
cargo run --example export_poem_variations_training_jsonl
```

## Measure results (primary = special_type)

| Slice | top-1 | MRR | correct@2 | n_eval |
|-------|------:|----:|----------:|-------:|
| special_type | 1.000 | 1.000 | 1.000 | 340 |
| variation | 0.158 | 0.496 | 0.579 | 380 |
| all | 0.556 | 0.734 | 0.778 | 720 |

No primary top-1 damage; ADOPT as pure SOA inventory freeze.
