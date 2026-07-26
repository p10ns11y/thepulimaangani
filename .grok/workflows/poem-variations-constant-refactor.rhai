// Generated draft — Grok Build workflow template.
// Install: copy to .grok/workflows/poem-variations-constant-refactor.rhai (or ~/.grok/workflows/).
// Requires Grok host APIs: agent(), phase(), log(), complete() — not rhai-host.
// Skill chain: introduce-named-constants → one-sample-per-type → derive-example-key-mirror

let meta = #{
    name: "poem-variations-constant-refactor",
    description: "Refactor poem data file to use single-source named constants, eliminate duplicate example rows, and keep alternates as comments",
    phases: [
        #{ title: "Explore", detail: "ReadFile + rg to locate 7 broken references and duplicate en values" },
        #{ title: "Normalize Keys", detail: "Introduce consts + tamilKeys map + variationRow helper" },
        #{ title: "Consolidate", detail: "Reduce to one row per type and archive extras" },
        #{ title: "Verify", detail: "Shell + ReadLints to confirm no lint or runtime issues" }
    ],
    when_to_use: "Refactor poem data file to use single-source named constants, eliminate duplicate example rows, and keep alternates as comments",
};

phase("Explore");
let r0 = agent(
    "Follow skill 'introduce-named-constants'. ReadFile + rg to locate 7 broken references and duplicate en values. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "introduce-named-constants",
        capability_mode: "read-only",
        output_schema: #{
            "type": "object",
            "required": ["done", "notes"],
            "properties": #{
                "done": #{ "type": "boolean" },
                "notes": #{ "type": "string" },
            },
        },
    },
);
if r0 == () || !r0.success {
    log("phase failed: introduce-named-constants");
}


phase("Normalize Keys");
let r1 = agent(
    "Follow skill 'one-sample-per-type'. Introduce consts + tamilKeys map + variationRow helper. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "one-sample-per-type",
        capability_mode: "read-write",
        output_schema: #{
            "type": "object",
            "required": ["done", "notes"],
            "properties": #{
                "done": #{ "type": "boolean" },
                "notes": #{ "type": "string" },
            },
        },
    },
);
if r1 == () || !r1.success {
    log("phase failed: one-sample-per-type");
}


phase("Consolidate");
let r2 = agent(
    "Follow skill 'derive-example-key-mirror'. Reduce to one row per type and archive extras. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "derive-example-key-mirror",
        capability_mode: "read-write",
        output_schema: #{
            "type": "object",
            "required": ["done", "notes"],
            "properties": #{
                "done": #{ "type": "boolean" },
                "notes": #{ "type": "string" },
            },
        },
    },
);
if r2 == () || !r2.success {
    log("phase failed: derive-example-key-mirror");
}


phase("Verify");
let r3 = agent(
    "Follow skill 'Verify'. Shell + ReadLints to confirm no lint or runtime issues. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "Verify",
        capability_mode: "read-write",
        output_schema: #{
            "type": "object",
            "required": ["done", "notes"],
            "properties": #{
                "done": #{ "type": "boolean" },
                "notes": #{ "type": "string" },
            },
        },
    },
);
if r3 == () || !r3.success {
    log("phase failed: Verify");
}

complete(#{
    summary: "Finished workflow poem-variations-constant-refactor",
    skill_chain: ["introduce-named-constants","one-sample-per-type","derive-example-key-mirror"],
});
