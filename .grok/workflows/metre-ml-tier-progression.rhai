// Progressive metre ML: Semantics + Ontology + Anthology foundations, then Tier A–D.
// Portfolio contract: tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md
// Each step: SOA check → tests first → implement → measure → ADOPT|REJECT|DEFER → ledger.
// Classical (Tier D) requires allow_classical=true and A12 frozen.

let meta = #{
    name: "metre-ml-tier-progression",
    description: "SOA foundations then Tier A-D metre ML, tests-first, measure before adopt",
    when_to_use: "Implement metre ML portfolio steps progressively with semantics ontology anthology gates",
    phases: [
        #{ title: "Bootstrap", detail: "Load portfolio, resolve steps, SOA inventory" },
        #{ title: "Step-SOA", detail: "Semantics ontology anthology invariants for this step" },
        #{ title: "Step-Tests", detail: "Write failing tests and contracts first" },
        #{ title: "Step-Implement", detail: "Minimal implementation to green tests" },
        #{ title: "Step-Measure", detail: "Metrics vs baseline; ADOPT REJECT DEFER" },
        #{ title: "Synthesize", detail: "Run ledger and next-step recommendation" },
    ],
};

let step_schema = #{
    "type": "object",
    "required": ["done", "step_id", "status", "improved", "metrics_summary", "notes", "soa_ok"],
    "properties": #{
        "done": #{ "type": "boolean" },
        "step_id": #{ "type": "string" },
        "status": #{ "type": "string" },
        "improved": #{ "type": "boolean" },
        "metrics_summary": #{ "type": "string" },
        "notes": #{ "type": "string" },
        "soa_ok": #{ "type": "boolean" },
        "ontology_notes": #{ "type": "string" },
        "semantics_notes": #{ "type": "string" },
        "anthology_notes": #{ "type": "string" },
        "files_touched": #{ "type": "array", "items": #{ "type": "string" } },
        "tests_added": #{ "type": "array", "items": #{ "type": "string" } },
    },
};

let bootstrap_schema = #{
    "type": "object",
    "required": ["ready", "soa_present", "baseline_present", "notes", "next_step_hint"],
    "properties": #{
        "ready": #{ "type": "boolean" },
        "soa_present": #{ "type": "boolean" },
        "baseline_present": #{ "type": "boolean" },
        "notes": #{ "type": "string" },
        "next_step_hint": #{ "type": "string" },
        "anthology_counts": #{ "type": "string" },
    },
};

// Canonical step order (must match METRE_ML_METHODS_PORTFOLIO.md §5)
let STEPS = [
    "S00_ontology_map",
    "S01_semantics_contract",
    "S02_anthology_inventory",
    "S03_soa_ledger",
    "A00_baseline_freeze",
    "A01_eval_harness",
    "A02_two_truth_schema",
    "A03_pure_dense_logistic",
    "A04_prototypes_knn",
    "A05_lda_pca_reports",
    "A06_mi_and_chi2",
    "A07_calibration",
    "A08_association_rules",
    "A09_sequence_motifs",
    "A10_ablation",
    "A11_counterfactuals",
    "A12_pattern_cards",
    "A13_head_ab",
    "B01_tree_importances",
    "B02_clustering",
    "B03_anomaly",
    "B04_kernel_nb_ceilings",
    "B05_hmm_crf_sketch",
    "B06_graph_motifs",
    "B07_dtw_emd",
    "B08_ordinal_likeness",
    "C01_active_learning",
    "C02_metric_learning",
    "C03_cnn_transformer_pilot",
    "C04_bayesian_line_filter",
    "C05_fst_scaffold",
    "D01_classical_violations",
    "D02_ilp_sat_backend",
    "D03_dual_compare_report",
];

fn step_pillar(id) {
    if id == "S00_ontology_map" { return "ontology"; }
    if id == "S01_semantics_contract" { return "semantics"; }
    if id == "S02_anthology_inventory" { return "anthology"; }
    if id == "S03_soa_ledger" { return "soa-all"; }
    if id.sub_string(0, 1) == "D" { return "classical-dual"; }
    if id.sub_string(0, 1) == "C" { return "tier-c"; }
    if id.sub_string(0, 1) == "B" { return "tier-b"; }
    "tier-a"
}

fn step_blurb(id) {
    if id == "S00_ontology_map" {
        return "Map ontology: Poem/Line/Foot/Syllable/Letter, MetreType, LinkageType, LinkageSpecialType, cir classes, dual-truth nodes. Write data/training/reports/ontology_map.md + enum exhaustiveness tests.";
    }
    if id == "S01_semantics_contract" {
        return "Semantics contract: dense[j] meanings, score scales, gold label meaning, serde aliases, presentation vs machine keys. Tests that pin PARSE_FEATURE_SCHEMA_VERSION and gold mapping. Write semantics_contract.md.";
    }
    if id == "S02_anthology_inventory" {
        return "Anthology inventory: special_type vs variation counts, per-metre balance, export paths, forbidden training uses, golden kural link. Write anthology_inventory.md + JSON counts.";
    }
    if id == "S03_soa_ledger" {
        return "Merge ontology+semantics+anthology into soa_ledger.md and soa_ledger.json with corpus fingerprint and schema ids.";
    }
    if id == "A00_baseline_freeze" {
        return "Freeze baseline: run MC, hybrid fit status, PCA, linkage_vs_gold; write dated baseline report under data/training/reports/.";
    }
    if id == "A01_eval_harness" {
        return "Unified metrics API: top-1, MRR, correct@2, confusion, bootstrap CI on special_type; variation reported separately.";
    }
    if id == "A02_two_truth_schema" {
        return "Two-truth schema: ml_* fields + empty classical_* slots; document product policy; ontology dual channels.";
    }
    if id == "A03_pure_dense_logistic" {
        return "Pure dense multinomial logistic head; tests first; measure vs baseline; optional embed.";
    }
    if id == "A04_prototypes_knn" {
        return "Class prototypes + k-NN on standardized dense; interpretability + metrics.";
    }
    if id == "A05_lda_pca_reports" {
        return "LDA + PCA loadings reports tied to PARSE_FEATURES index names.";
    }
    if id == "A06_mi_and_chi2" {
        return "Mutual information dense_j↔metre + chi-square linkage×metre.";
    }
    if id == "A07_calibration" {
        return "Probability calibration + reliability diagram metrics (ECE).";
    }
    if id == "A08_association_rules" {
        return "Association/itemset rules from discrete ontology tokens to metre.";
    }
    if id == "A09_sequence_motifs" {
        return "Frequent Ner/Nirai sequence motifs from anthology parses.";
    }
    if id == "A10_ablation" {
        return "Block ablation of dense feature groups; record sensitivity.";
    }
    if id == "A11_counterfactuals" {
        return "Counterfactual feature flips; prediction change table.";
    }
    if id == "A12_pattern_cards" {
        return "Per-metre pattern cards + disagreement set (ML≠parent_metre).";
    }
    if id == "A13_head_ab" {
        return "A/B table: heuristic vs hybrid vs logistic vs k-NN with bootstrap notes.";
    }
    if id == "B01_tree_importances" {
        return "Offline RF/GBM importances; distill human-readable rules; do not poison anthology splits.";
    }
    if id == "B02_clustering" {
        return "k-means/GMM/hierarchical clustering of dense vs gold ontology labels.";
    }
    if id == "B03_anomaly" {
        return "Anomaly/outlier detection for bad anthology rows or parses.";
    }
    if id == "B04_kernel_nb_ceilings" {
        return "Kernel SVM + Naive Bayes ceiling models (offline first).";
    }
    if id == "B05_hmm_crf_sketch" {
        return "HMM/CRF research sketch on scansion sequences; not product default.";
    }
    if id == "B06_graph_motifs" {
        return "Foot–talai graph motifs as features under ontology edges.";
    }
    if id == "B07_dtw_emd" {
        return "DTW on acai sequences and/or EMD on linkage histograms.";
    }
    if id == "B08_ordinal_likeness" {
        return "Continuous ordinal likeness scores per coarse metre.";
    }
    if id == "C01_active_learning" {
        return "Active learning plan: high-entropy queries to grow anthology labels.";
    }
    if id == "C02_metric_learning" {
        return "Metric learning only if N justifies after C01.";
    }
    if id == "C03_cnn_transformer_pilot" {
        return "Small CNN/Transformer pilot only if dense heads plateau and labels grew.";
    }
    if id == "C04_bayesian_line_filter" {
        return "Line-by-line Bayesian metre belief update (control-style observer).";
    }
    if id == "C05_fst_scaffold" {
        return "FST/grammar scaffold only; not full classical verifier.";
    }
    if id == "D01_classical_violations" {
        return "Implement classical_checker violations per MACHINE_FIRST_SPEC; orthogonal to ML score.";
    }
    if id == "D02_ilp_sat_backend" {
        return "Optional ILP/SAT classical backend; ML proposes, solver verifies.";
    }
    if id == "D03_dual_compare_report" {
        return "Dual ML vs classical comparison report and product display policy.";
    }
    "See METRE_ML_METHODS_PORTFOLIO.md for this step_id."
}

fn is_classical_step(id) {
    id.sub_string(0, 1) == "D"
}

fn is_soa_step(id) {
    id.sub_string(0, 1) == "S"
}

// --- args ---
let start_step = 0;
let max_steps = 1;
let skip_user_gates = false;
let allow_classical = false;
let require_soa = true;
let force_step_id = ();

if args != () {
    if args.start_step != () { start_step = args.start_step; }
    if args.max_steps != () { max_steps = args.max_steps; }
    if args.skip_user_gates != () { skip_user_gates = args.skip_user_gates; }
    if args.allow_classical != () { allow_classical = args.allow_classical; }
    if args.require_soa != () { require_soa = args.require_soa; }
    if args.force_step_id != () { force_step_id = args.force_step_id; }
}

if start_step < 0 { start_step = 0; }
if max_steps < 1 { max_steps = 1; }
if max_steps > 4 {
    log("max_steps capped at 4 per run to keep quality; raise across multiple runs");
    max_steps = 4;
}

let n_steps = STEPS.len();
if start_step >= n_steps {
    pause("verification", "start_step out of range; STEPS has " + n_steps.to_string() + " entries (0-based).");
}

// Resolve work list
let work = [];
if force_step_id != () {
    let found = false;
    for s in STEPS {
        if s == force_step_id {
            found = true;
            work.push(s);
        }
    }
    if !found {
        pause("verification", "force_step_id not in STEPS: " + force_step_id);
    }
} else {
    let end = start_step + max_steps;
    if end > n_steps { end = n_steps; }
    let idx = 0;
    for s in STEPS {
        if idx >= start_step && idx < end {
            work.push(s);
        }
        idx += 1;
    }
}

if work.len() == 0 {
    complete(#{ summary: "No steps to run", work: [] });
}

phase("Bootstrap");
let boot_prompt = "";
boot_prompt += "You are bootstrapping the metre-ml-tier-progression workflow in thepulimaangani.\n";
boot_prompt += "MUST use tools (read_file, list_dir, grep, shell). Do not answer from memory.\n";
boot_prompt += "1) Read tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md (SOA + step order).\n";
boot_prompt += "2) Read METRE_PREDICTION.md, PARSE_FEATURES.md, TRAINING_PROCESS.md skim if needed.\n";
boot_prompt += "3) Check data/training/reports/ for soa_ledger.md, ontology_map.md, semantics_contract.md, anthology_inventory.md, baselines.\n";
boot_prompt += "4) Note anthology sources: poem_variations, special_type vs variation, training csv/jsonl.\n";
boot_prompt += "5) List work steps for this run (will be provided in next agents): inventory readiness only.\n";
boot_prompt += "Return soa_present true only if soa_ledger.md exists with ontology+semantics+anthology coverage.\n";
boot_prompt += "Return baseline_present if any baseline_*.md or A00 artifacts exist.\n";
boot_prompt += "ready=true if repo is writable and docs readable.\n";

let boot = agent(boot_prompt, #{
    label: "bootstrap-soa",
    capability_mode: "read-only",
    output_schema: bootstrap_schema,
});

let soa_present = false;
let baseline_present = false;
if boot != () && boot.success && boot.output != () {
    if boot.output.soa_present == true { soa_present = true; }
    if boot.output.baseline_present == true { baseline_present = true; }
    log("bootstrap: " + boot.output.notes);
} else {
    log("bootstrap agent failed or incomplete; continuing with fail-closed SOA assumptions");
}

let decisions = [];
let wi = 0;
for step_id in work {
    let pillar = step_pillar(step_id);
    let blurb = step_blurb(step_id);
    let skip_body = false;
    let st = "blocked";
    let improved = false;
    let notes = "";
    let metrics_summary = "";
    let soa_ok = false;

    if is_classical_step(step_id) && allow_classical != true {
        log("skip classical step without allow_classical: " + step_id);
        decisions.push(#{
            step_id: step_id,
            status: "DEFER",
            improved: false,
            notes: "Set args.allow_classical=true after A12 freeze",
            soa_ok: true,
            pillar: pillar,
        });
        skip_body = true;
    }

    if !skip_body && require_soa && !is_soa_step(step_id) && !soa_present && start_step > 3 {
        await_user("verification", "SOA ledger missing (require_soa). Resume after S00-S03 or set require_soa=false.");
    }

    if !skip_body {
        log("=== step " + step_id + " (" + pillar + ") ===");

        phase("Step-SOA");
        let soa_p = "";
        soa_p += "STEP " + step_id + " — SOA gate (Semantics, Ontology, Anthology).\n";
        soa_p += "Pillar focus: " + pillar + "\n";
        soa_p += "Goal: " + blurb + "\n";
        soa_p += "Read METRE_ML_METHODS_PORTFOLIO.md §5.2 and existing data/training/reports/* SOA files.\n";
        soa_p += "Use grep/read_file on tamil-seiyul-alagi/src for types, linkage, metre, poem_variations.\n";
        soa_p += "Produce concrete notes: ontology entities touched, semantic invariants to test, anthology split allowed for this step.\n";
        soa_p += "special_type = primary gold; variation = stress only unless step explicitly inventories it.\n";
        soa_p += "Classical checker stays empty unless step is D01+ and allow_classical was granted.\n";
        soa_p += "Set done=true if SOA constraints for this step are clear enough to write tests.\n";
        soa_p += "status=ADOPT only if no code change needed; else status=partial. improved=false unless you only document.\n";
        soa_p += "soa_ok=true only if no contradiction with portfolio.\n";

        let soa_r = agent(soa_p, #{
            label: "soa:" + step_id,
            capability_mode: "read-write",
            output_schema: step_schema,
        });

        if soa_r != () && soa_r.success && soa_r.output != () && soa_r.output.soa_ok == true {
            soa_ok = true;
        }
        if !soa_ok {
            log("SOA gate weak/failed for " + step_id + "; continuing to tests with caution");
        }

        phase("Step-Tests");
        let test_p = "";
        test_p += "TEST-FIRST for step " + step_id + ".\n";
        test_p += blurb + "\n";
        test_p += "MANDATORY: write tests BEFORE production implementation (TDD).\n";
        test_p += "Choose best fit: unit, property/invariant, golden, integration, MC regression, snapshot, performance if latency-critical.\n";
        test_p += "Ontology: assert enum/coverage invariants if step touches types.\n";
        test_p += "Semantics: assert dense length/schema_version/gold mapping if step touches features.\n";
        test_p += "Anthology: tests must use special_type for primary metrics; isolate variation.\n";
        test_p += "Tests should FAIL or be clearly red on missing APIs until implement step.\n";
        test_p += "Write tests under tamil-seiyul-alagi (src tests or tests/). Document paths in tests_added.\n";
        test_p += "Run cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml for the new tests; note expected red.\n";
        test_p += "Do NOT implement full feature yet. status=partial, improved=false, soa_ok as appropriate.\n";
        test_p += "Put decision notes under data/training/reports/step_" + step_id + "/tests_added.md if creating dirs.\n";

        let test_r = agent(test_p, #{
            label: "tests:" + step_id,
            capability_mode: "all",
            output_schema: step_schema,
        });

        let tests_ok = test_r != () && test_r.success;
        if !tests_ok {
            log("tests agent failed for " + step_id);
            decisions.push(#{
                step_id: step_id,
                status: "blocked",
                improved: false,
                notes: "test-first agent failed",
                soa_ok: soa_ok,
                pillar: pillar,
            });
            if skip_user_gates != true {
                await_user("no_progress", "Tests step failed for " + step_id + ". Fix or resume to skip implement.");
            }
        }

        let impl_ok = false;
        if tests_ok {
            phase("Step-Implement");
            let impl_p = "";
            impl_p += "IMPLEMENT step " + step_id + " only enough to green the tests just written.\n";
            impl_p += blurb + "\n";
            impl_p += "Constraints from portfolio: no classical scoring merge; no training bulk on variation; bump schema if dense meaning changes.\n";
            impl_p += "Prefer tamil-seiyul-alagi/src/ml_eval/ for research helpers; metre/ for production heads.\n";
            impl_p += "Update SOA artifacts if you introduce terms, semantic changes, or anthology fingerprints.\n";
            impl_p += "Run cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml. If WASM/TS touched, pnpm run precommit or gate.\n";
            impl_p += "status=partial until measure decides ADOPT. improved=false here.\n";
            impl_p += "List files_touched.\n";

            let impl_r = agent(impl_p, #{
                label: "impl:" + step_id,
                capability_mode: "all",
                output_schema: step_schema,
            });
            impl_ok = impl_r != () && impl_r.success;
            if !impl_ok {
                log("implement failed for " + step_id);
                decisions.push(#{
                    step_id: step_id,
                    status: "blocked",
                    improved: false,
                    notes: "implement agent failed",
                    soa_ok: soa_ok,
                    pillar: pillar,
                });
                if skip_user_gates != true {
                    await_user("no_progress", "Implement failed for " + step_id);
                }
            }
        }

        if tests_ok && impl_ok {
            phase("Step-Measure");
            let meas_p = "";
            meas_p += "MEASURE and DECIDE for step " + step_id + ".\n";
            meas_p += blurb + "\n";
            meas_p += "Run relevant commands from portfolio §6.4 (MC, PCA, exports, cargo test).\n";
            meas_p += "Primary metrics on special_type; report variation separately.\n";
            meas_p += "ADOPT if primary metric improves (bootstrap-aware) OR pure interpretability step without >2pp top-1 damage.\n";
            meas_p += "REJECT if no gain and no unique interpretability, or tests/schema break.\n";
            meas_p += "DEFER if blocked on data or dependency.\n";
            meas_p += "Write data/training/reports/step_" + step_id + "/metrics.json, decision.md, soa_delta.md.\n";
            meas_p += "For S00-S03, success = complete SOA artifacts; improved may be false.\n";
            meas_p += "Set status to ADOPT, REJECT, or DEFER (exact spelling).\n";
            meas_p += "Set improved=true only on ADOPT with measured or SOA-foundation value.\n";
            meas_p += "Fill ontology_notes, semantics_notes, anthology_notes briefly.\n";
            meas_p += "If this is S03 and ledger written, say so clearly in notes.\n";

            let meas_r = agent(meas_p, #{
                label: "measure:" + step_id,
                capability_mode: "all",
                output_schema: step_schema,
            });

            st = "blocked";
            improved = false;
            notes = "";
            metrics_summary = "";
            if meas_r != () && meas_r.success && meas_r.output != () {
                if meas_r.output.status != () { st = meas_r.output.status; }
                if meas_r.output.improved == true { improved = true; }
                if meas_r.output.notes != () { notes = meas_r.output.notes; }
                if meas_r.output.metrics_summary != () { metrics_summary = meas_r.output.metrics_summary; }
                if meas_r.output.soa_ok == true { soa_ok = true; }
                if step_id == "S03_soa_ledger" && st == "ADOPT" {
                    soa_present = true;
                }
                if step_id == "A00_baseline_freeze" && st == "ADOPT" {
                    baseline_present = true;
                }
            } else {
                notes = "measure agent failed";
            }

            // Skeptic on ADOPT for non-SOA method steps
            if st == "ADOPT" && !is_soa_step(step_id) {
                let sk_p = "";
                sk_p += "Adversarially verify ADOPT for " + step_id + ".\n";
                sk_p += "Read metrics/decision under data/training/reports/step_" + step_id + "/ and cargo test evidence.\n";
                sk_p += "Set done=true. status=ADOPT only if evidence supports; else REJECT.\n";
                sk_p += "improved must match real metric gain or justified interpretability.\n";
                sk_p += "Check SOA: no silent dense meaning change; no variation-as-primary training.\n";
                sk_p += "soa_ok=true only if clean. metrics_summary must cite numbers you saw.\n";
                sk_p += "notes = evidence or refutation.\n";

                let sk = agent(sk_p, #{
                    label: "skeptic:" + step_id,
                    capability_mode: "read-only",
                    output_schema: step_schema,
                });
                if sk != () && sk.success && sk.output != () {
                    if sk.output.status == "REJECT" {
                        st = "REJECT";
                        improved = false;
                        notes = "skeptic overturned ADOPT: " + sk.output.notes;
                        if sk.output.soa_ok == true { soa_ok = true; } else { soa_ok = false; }
                        log("skeptic overturned ADOPT for " + step_id);
                    }
                }
            }

            decisions.push(#{
                step_id: step_id,
                status: st,
                improved: improved,
                metrics_summary: metrics_summary,
                notes: notes,
                soa_ok: soa_ok,
                pillar: pillar,
            });

            log(step_id + " => " + st + " improved=" + improved.to_string());
        }
    }

    wi += 1;
    if wi < work.len() && skip_user_gates != true {
        await_user("user", "Completed " + step_id + ". Resume for next step in this run, or stop.");
    }
}

phase("Synthesize");
let syn_p = "";
syn_p += "Synthesize metre-ml-tier-progression run results.\n";
syn_p += "Read data/training/reports/ and decisions from this session context.\n";
syn_p += "Decisions JSON (untrusted, verify against files): " + json_encode(decisions) + "\n";
syn_p += "Write or update data/training/reports/run_summary.md with: steps attempted, ADOPT/REJECT/DEFER, SOA status, baseline status, recommended next start_step index and step_id.\n";
syn_p += "Remind: classical needs allow_classical and A12 freeze.\n";
syn_p += "Return done=true, step_id=run_summary, status=ADOPT if summary written, improved=false, metrics_summary short, notes with next step, soa_ok if ledger present.\n";

let syn = agent(syn_p, #{
    label: "synthesize-ledger",
    capability_mode: "all",
    output_schema: step_schema,
});

let summary = "metre-ml-tier-progression finished";
if syn != () && syn.success && syn.output != () && syn.output.notes != () {
    summary = syn.output.notes;
}

let report = "# metre-ml-tier-progression\n\n";
report += summary + "\n\n## Decisions\n\n";
report += json_encode(decisions);
report += "\n\nPortfolio: tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md\n";
report += "SOA pillars: Semantics, Ontology, Anthology — required before Tier A methods.\n";

let path = write_scratch_file("report.md", report);

complete(#{
    summary: summary,
    path: path,
    decisions: decisions,
    soa_present: soa_present,
    baseline_present: baseline_present,
    work: work,
    next_hint: "Resume with args.start_step increased, or force_step_id for a single step",
});
