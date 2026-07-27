// Complete metre-ML Tier A–D plate + product Metre UI/UX phase.
// Supplements metre-ml-tier-progression.rhai; assumes S00–S03 may already exist.

let meta = #{
    name: "metre-ml-tier-and-ui",
    description: "Tier A-D metre ML modules + Metre panel UI/UX product surface",
    when_to_use: "Finish portfolio A00-D03 with dual-truth and learner-visible Metre UX",
    phases: [
        #{ title: "Inventory", detail: "SOA + A00-D03 gap check" },
        #{ title: "Rust-Tier", detail: "Implement/verify ml_eval + classical dual path" },
        #{ title: "UI-Wire", detail: "adapt + Structure Metre panel product fields" },
        #{ title: "Verify", detail: "cargo + vitest + inventory evidence" },
    ],
};

let step_schema = #{
    "type": "object",
    "required": ["done", "status", "notes"],
    "properties": #{
        "done": #{ "type": "boolean" },
        "status": #{ "type": "string" },
        "notes": #{ "type": "string" },
        "improved": #{ "type": "boolean" },
    },
};

phase("Inventory");
let inv_p = "";
inv_p += "Inventory metre ML plate on thepulimaangani.\n";
inv_p += "Read tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md §5 and data/training/reports/.\n";
inv_p += "Confirm S03 soa_ledger and every step_A00..step_D03 pack exists OR list gaps.\n";
inv_p += "Use list_dir/grep. done=true if inventory written mentally; status=ADOPT if complete else partial.\n";
let inv = agent(inv_p, #{ label: "inventory", capability_mode: "read-only", output_schema: step_schema });
if inv == () || !inv.success { log("inventory weak"); }

phase("Rust-Tier");
let rust_p = "";
rust_p += "Verify/implement Tier A-D under tamil-seiyul-alagi/src/ml_eval/ and classical_checker.\n";
rust_p += "Must keep classical violations parallel to ML scores (metre_ml dual_truth).\n";
rust_p += "A12_PATTERN_FREEZE gates D01. Run cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml.\n";
rust_p += "status=ADOPT if tests green. notes=summary.\n";
let rust = agent(rust_p, #{ label: "rust-tier", capability_mode: "all", output_schema: step_schema });
if rust == () || !rust.success { log("rust-tier agent failed"); }

phase("UI-Wire");
let ui_p = "";
ui_p += "Wire Metre UI/UX: adaptWasmParseJson metre_ml + StructureAccordion honesty/dual-truth/heads/pattern features.\n";
ui_p += "Tests: src/lib/__tests__/metreMlAdaptUi.test.ts on real adapt path.\n";
ui_p += "Run pnpm exec vitest run src/lib/__tests__/metreMlAdaptUi.test.ts and pnpm run typecheck if needed.\n";
ui_p += "status=ADOPT when UI shows Statistical honesty from live parse fields.\n";
let ui = agent(ui_p, #{ label: "ui-wire", capability_mode: "all", output_schema: step_schema });
if ui == () || !ui.success { log("ui-wire agent failed"); }

phase("Verify");
let ver_p = "";
ver_p += "Final verify: cargo test parser; vitest metreMlAdaptUi; inventory all A00-D03 reports present.\n";
ver_p += "Write data/training/reports/tier_ad_ui_run_summary.md with status.\n";
ver_p += "done=true status=ADOPT notes=next steps if any.\n";
let ver = agent(ver_p, #{ label: "verify", capability_mode: "all", output_schema: step_schema });

let summary = "metre-ml-tier-and-ui finished";
if ver != () && ver.success && ver.output.notes != () { summary = ver.output.notes; }
let path = write_scratch_file("report.md", "# metre-ml-tier-and-ui\n\n" + summary + "\n");
complete(#{ summary: summary, path: path });
