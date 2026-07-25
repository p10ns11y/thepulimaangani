// Generated draft — Grok Build workflow template.
// Install: copy to .grok/workflows/github-cards-dashboard-sync.rhai (or ~/.grok/workflows/).
// Requires Grok host APIs: agent(), phase(), log(), complete() — not rhai-host.
// Skill chain: align-route-to-reference → apply-prefers-color-scheme-theme → replace-static-with-dynamic-fetch

let meta = #{
    name: "github-cards-dashboard-sync",
    description: "End-to-end update of ghcards routes and live dashboard: reference alignment, theming, dynamic data, layout/refresh fixes, and build compliance",
    phases: [
        #{ title: "Explore", detail: "Read reference route and grep siblings for inconsistencies" },
        #{ title: "Fix", detail: "Propagate patterns, add theme module, replace static data" },
        #{ title: "Polish", detail: "Resolve layout, refresh, and Next.js build errors" }
    ],
    when_to_use: "End-to-end update of ghcards routes and live dashboard: reference alignment, theming, dynamic data, layout/refresh fixes, and build compliance",
};

phase("Explore");
let r0 = agent(
    "Follow skill 'align-route-to-reference'. Read reference route and grep siblings for inconsistencies. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "align-route-to-reference",
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
    log("phase failed: align-route-to-reference");
}


phase("Fix");
let r1 = agent(
    "Follow skill 'apply-prefers-color-scheme-theme'. Propagate patterns, add theme module, replace static data. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "apply-prefers-color-scheme-theme",
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
    log("phase failed: apply-prefers-color-scheme-theme");
}


phase("Polish");
let r2 = agent(
    "Follow skill 'replace-static-with-dynamic-fetch'. Resolve layout, refresh, and Next.js build errors. Use read-only tools first when mapping; "
        + "then apply edits. Report {done: bool, notes: string}.",
    #{
        label: "replace-static-with-dynamic-fetch",
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
    log("phase failed: replace-static-with-dynamic-fetch");
}

complete(#{
    summary: "Finished workflow github-cards-dashboard-sync",
    skill_chain: ["align-route-to-reference","apply-prefers-color-scheme-theme","replace-static-with-dynamic-fetch"],
});
