// Generated draft — Grok Build workflow template.
// Install: copy to .grok/workflows/docs-canvas-architecture-alignment.rhai (or ~/.grok/workflows/).
// Requires Grok host APIs: agent(), phase(), log(), complete() — not rhai-host.
// Skill chain: docs-reliability-review → archy-first-doc-alignment

let meta = #{
    name: "docs-canvas-architecture-alignment",
    description: "Review live code paths, align docs to true main controller, then commit updated installation/usage flows",
    phases: [
        #{ title: "Review", detail: "docs-canvas + CLI verification" },
        #{ title: "Align", detail: "rewrite README and coming-next around archy" },
        #{ title: "Publish", detail: "commit and push to feature branch" }
    ],
    when_to_use: "Review live code paths, align docs to true main controller, then commit updated installation/usage flows",
};

phase("Review");
let r0 = agent(
    "Follow skill 'docs-reliability-review'. docs-canvas + CLI verification. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "docs-reliability-review",
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
    log("phase failed: docs-reliability-review");
}


phase("Align");
let r1 = agent(
    "Follow skill 'archy-first-doc-alignment'. rewrite README and coming-next around archy. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "archy-first-doc-alignment",
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
    log("phase failed: archy-first-doc-alignment");
}


phase("Publish");
let r2 = agent(
    "Follow skill 'Publish'. commit and push to feature branch. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "Publish",
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
    log("phase failed: Publish");
}

complete(#{
    summary: "Finished workflow docs-canvas-architecture-alignment",
    skill_chain: ["docs-reliability-review","archy-first-doc-alignment"],
});
