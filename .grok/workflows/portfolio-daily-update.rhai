// Generated draft — Grok Build workflow template.
// Install: copy to .grok/workflows/portfolio-daily-update.rhai (or ~/.grok/workflows/).
// Requires Grok host APIs: agent(), phase(), log(), complete() — not rhai-host.
// Skill chain: scan-portfolio-git-activity → update-session-notes → verify-and-close-card

let meta = #{
    name: "portfolio-daily-update",
    description: "End-to-end daily workflow that ingests recent commits into project sessions, verifies CI merges and local state, closes cards, and commits the resulting documentation.",
    phases: [
        #{ title: "Explore", detail: "Glob projects and shell git activity since yesterday" },
        #{ title: "Document", detail: "Write/StrReplace 2026-07-15 session notes and project cards" },
        #{ title: "Verify", detail: "Shell sync checks, mark complete or defer" },
        #{ title: "Publish", detail: "Shell commit and push with summary" }
    ],
    when_to_use: "End-to-end daily workflow that ingests recent commits into project sessions, verifies CI merges and local state, closes cards, and commits the resulting documentation.",
};

phase("Explore");
let r0 = agent(
    "Follow skill 'scan-portfolio-git-activity'. Glob projects and shell git activity since yesterday. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "scan-portfolio-git-activity",
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
    log("phase failed: scan-portfolio-git-activity");
}


phase("Document");
let r1 = agent(
    "Follow skill 'update-session-notes'. Write/StrReplace 2026-07-15 session notes and project cards. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "update-session-notes",
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
    log("phase failed: update-session-notes");
}


phase("Verify");
let r2 = agent(
    "Follow skill 'verify-and-close-card'. Shell sync checks, mark complete or defer. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "verify-and-close-card",
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
    log("phase failed: verify-and-close-card");
}


phase("Publish");
let r3 = agent(
    "Follow skill 'Publish'. Shell commit and push with summary. Use read-only tools first when mapping; "
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
if r3 == () || !r3.success {
    log("phase failed: Publish");
}

complete(#{
    summary: "Finished workflow portfolio-daily-update",
    skill_chain: ["scan-portfolio-git-activity","update-session-notes","verify-and-close-card"],
});
