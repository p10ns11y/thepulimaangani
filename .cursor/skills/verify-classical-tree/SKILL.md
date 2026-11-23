---
name: verify-classical-tree
description: Re-check the classical decision-tree routes, share gates, and gate-walk order after a change to the tree, the decision module, or the TLA model. Use when editing tamil-seiyul-alagi/src/classical_tree.rs, classical_decision.rs, tamil-seiyul-alagi/verify/ClassicalTreeWalk.tla, or docs/classical-tree-walk.mmd.
---

# Verify the classical tree

The classical tree picks one leaf beside the ML verdict. These checks lock the share arithmetic and the order of that walk. They do not prove that a Tamil poem's syllables were classified correctly.

## One command

From the repo root:

`bash scripts/verify-classical-tree.sh`

Pinned tools, installed by that script when missing:

- Kani 0.68.0, via the `kani-verifier` 0.68.0 cargo plugin. The plugin builds on Rust 1.88.0. `cargo kani setup` then uses nightly-2026-08-21 and CBMC 6.11.0.
- TLA+ tools 1.7.4 (`tla2tools.jar`, sha256 `936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88`). Needs Java 21. The jar is cached under `tamil-seiyul-alagi/target/verify/` and is not committed.

The same command is the `classical-verify` GitHub Actions job.

## Why these tools

Kani checks the Rust functions on every input inside a small bound. That fits the share arithmetic and the 37-gate scan, because those are code, not a story about the code.

TLA+ checks the order of the walk: which leaf is reached, and where strict-first and Avalokitam first-match disagree. That is an ordering question over 37 gates. A model checker is the fit. TLC's insertion sort of the gate table is the same order as `ordered_gate_indexes`.

Lean is not used. The share comparisons are saturating integer arithmetic on poem-sized counts. Kani already covers every `u8` part, whole, and percent, which is every share a line of this size can produce. An all-sizes proof would have to model `saturating_mul`, which is a different statement from the comparison the tree runs. No lemma failed inside the bound.

## What is verified

| Property | Where | Bound | Pass means |
| --- | --- | --- | --- |
| Strict share is `part * 100 > whole * percent`, and a zero whole fails | `strict_above` | `part`, `whole`, `percent` are `u8`, widened to `u16` before multiplying | An exact 40, 50, 25, or 90 does not pass |
| Tenth rounding matches `(part * 10 + whole / 2) / whole`, then `tenths * 10 >= 40` | `round_to_tenth` | same `u8` bound, plus the two documented cases | 7/18 passes and 6/18 fails, and neither is a strict-above pass |
| The named routes reject an exact percent | `share_passes` on the five routes | the documented fractions 2/5, 1/2, 1/4, 9/10, 7/18, 6/18 | The route in force is the one the trace names |
| The scan returns one leaf and the same leaf if run again | `first_in_fixed_order` and `family_scan_fixed_order` | every pattern of 37 pass bits, both orders | At most one leaf, and the family scan agrees with the plain scan |
| Every leaf is reached when it is the only passing gate | `ClassicalTreeWalk.tla` invariant `EveryLeaf` | the 37-gate table | A singleton pass set returns that gate under both orders |
| The four named order pairs are real disagreements, and there are 142 such doubletons | invariants `NamedAreOverlaps`, `OverlapCount` | pass bits treated as independent | The over-approximation is stable |
| On a doubleton, the two orders agree, or the winner pair is one of those 142 | invariant `AgreeOnDoubletons` | every unordered pair of gates | A disagreement is listed, not silent |
| The repeated-தனிச்சொல் probe disagrees | invariant `KnownProbeDisagrees` | the pair `kattalai_kalithurai`, `velivirutham` | Strict-first keeps கட்டளைக்கலித்துறை. Avalokitam keeps வெளிவிருத்தம் |
| The 13 பா-over-பாவினம் pairs agree | invariant `AllowedShadowsAgree` | each pair in `AllowedShadows` | Both orders return the பா. The pair is not a counterexample |

The 142 doubletons are an over-approximation. Real poems cannot combine many of those pairs, because the line shapes exclude each other. The four pairs named in `docs/classical-tree.md` are inside the 142. `sinthadi_vanjippaa` against `kalivenpaa_long_osai` is the same வஞ்சி-versus-ஓசை case as the named வஞ்சி pair.

The one poem that does disagree is four copies of `கனந்தரும் பூங்குழ லாளபி ராமி - கடைக்கண்களே`. That is `KnownOrderCounterexample`. The route in force is `RepeatedTanicholRoute::KeepStrictFirstKattalai`, so the leaf stays கட்டளைக்கலித்துறை. `RejectRepeatedLineFinalTanichol` and `VenpaaVinamBeforeKalippaaVinam` are named and not chosen.

`AllowedShadows` is the பா-over-பாவினம் set: குறள் வெண்பா over குறட்டாழிசை, சிந்தியல் over வெண்டாழிசை and வெண்டுறை, தரவு over கலிவிருத்தம், ஆசிரியப்பா over துறை and தாழிசை. Both orders return the பா.

`AlwaysAgree` is defined in the module and is not an invariant of the pass config. The counter config (`ClassicalTreeWalkCounter.cfg`) checks `NoDisagreement` and must exit non-zero. The script treats a zero exit there as a failure of the check, and it requires the trace to name `kattalai_kalithurai` against `velivirutham`. The full abstract set is still `OverlapPairs`.

## What a failure looks like

These scratches were applied and then reverted. Do not leave them in the tree.

- Replacing `>` with `>=` in `strict_above` makes `share_passes(SHARE_STRICT_40, 2, 5)` true. Kani fails the assertion that an exact 2/5 does not pass the 40 gate. An exact 40 percent would be accepted.
- Removing the half-up term `whole / 2` from `round_to_tenth` makes 7/18 stay at 3 tenths. Kani fails `round_to_tenth(7, 18, 40)`. The documented கனி case would be rejected.
- Making `first_in_fixed_order` keep the last passing gate instead of the first makes it disagree with `family_scan_fixed_order` whenever two gates pass. Kani fails that equality. Two passing gates would no longer resolve to the earlier one.
- Setting `ExpectedOverlapCount` to 141 makes TLC fail `OverlapCount`. The invariant says the number of disagreeing doubletons is not 142.

## A bug or a modeling error

Replay the counterexample on the Rust function or on one `/types` poem.

- If the step can happen in `evaluate_classical_tree` and the leaf or the share result is wrong, it is a bug. Report it. Do not weaken the property to hide it.
- If the step uses a pass-bit combination that no poem can produce, it is the 142-pair over-approximation. Keep it as a finding about the model. Do not delete the pair unless the gate table itself changed.
- If TLC and the Rust test `tla_gate_table_matches_the_rust_facts` disagree on id, rank, or count, the model has drifted from `GATE_FACTS`. Update the model from the Rust table, then rerun.

## Not covered

- `classical_tree_does_not_panic_up_to_one_line` is a Kani harness for an empty-text poem of at most one line, one foot, one syllable, and one bond. It is not in the command. Unwind 40 unrolls every loop inside `evaluate_classical_tree`, and CBMC was still unwinding after minutes and several GB. There is no proof that the tree cannot panic on a small poem. `cargo test` still runs the `/types` poems.
- Syllable classification, linkage classification, and the ML head are out of scope. `metre_ml` must stay byte-identical when only the tree trace changes.
- The product walk records a family prefix and then stops. The proof's family scan still looks at every gate bit. They match only because a failed family prefix fails every gate in that family. A change that records a passing discriminator after a failed prefix breaks that argument. Re-check `matching_leaf` against the report leaf on the `/types` rows.

## State chart

`docs/classical-tree-walk.mmd` is generated by `walk_state_chart_mermaid`. Refresh it from `tamil-seiyul-alagi` with `UPDATE_CLASSICAL_WALK=1 cargo +1.85.0 test --offline --lib walk_state_chart_matches_the_committed_diagram`. The lockfile needs Rust 1.85.0; the default 1.83 toolchain cannot compile it. The committed SVG and PNG are rendered with `docs/classical-tree-walk.css` so edge labels use Noto Sans Tamil. The init line in the `.mmd` file is not enough on its own: without that CSS, `பொருந்தும்` did not paint.

For a TLA+ result, read it with the pstack `/statechart` skill. Do not copy that skill's commands, options, or paths into this one. After the tree changes and this skill was not used, use `/maintain-formal-verification-skill`.

## Coverage

- `tamil-seiyul-alagi/src/classical_decision.rs`: `strict_above`, `round_to_tenth`, `share_passes`, `ordered_gate_indexes`, `first_in_fixed_order`, `family_scan_fixed_order`, `STRICT_GATE_ORDER`, `AVALOKITAM_GATE_ORDER`, the share constants, `REPEATED_TANICHOL_ROUTE`, `ALLOWED_PAA_SHADOWS`, `kalivenpaa_route_for_gate`, and the route enums the trace prints.
- `tamil-seiyul-alagi/src/classical_tree.rs`: `evaluate_classical_tree` calls those routes. The leaf on each `/types` row is locked by `each_types_example_lands_on_its_leaf`. The harness `classical_tree_does_not_panic_up_to_one_line` is not a finished proof.
- `tamil-seiyul-alagi/verify/ClassicalTreeWalk.tla` and the two configs. The Rust test `tla_gate_table_matches_the_rust_facts` checks the gate rows against `GATE_FACTS`.

Sync commit: `935a1bd8840112058278085684b1518e336fd4d4`. Move this forward only after the command above has passed on the commit you name, and the files listed here still describe that commit.
