---
name: adversarial-audit
description: >-
  Adversarial verification of claimed work: read shipped modules (not memory),
  grep wiring and approvals, run tests, demand evidence before pass verdict.
  Use when reviewing agent output, PRs, or security-sensitive changes before merge.
  Triggers: adversarial audit, refute claims, evidence before verdict, pre-merge review.
---

# adversarial-audit

> **Load rule:** Formal SoT. **Distinct from** re-running verify cmds alone ([agent-orchestrator](../agent-orchestrator/SKILL.md) VERIFY) and from Outer REVIEW_GATE shape ([control-graph](../control-graph/SKILL.md)) — this skill is **refute-first evidence pack** with independent reads.

```text
// Role
Reviewer ⊥ ImplementerContext   // fresh session/context; try to refute claims

// Axioms
A1  Default real=false until independent evidence
A2  Read shipped files + run commands — never trust summary alone
A3  Verdict requires: scope check + tests/cmds + explicit gaps
A4  Compose: Orch owns re-run of verify cmds; CG owns when REVIEW_GATE fires; this skill owns attack surface + evidence artifact
A5  Fail closed on missing evidence for security/auth/deps claims
A6  Evaluate(δ) ≔ (C, E, η)
```

Related: [agent-orchestrator](../agent-orchestrator/SKILL.md) · [control-graph](../control-graph/SKILL.md) · [fix-dependency-security](../fix-dependency-security/SKILL.md).

---

## Use / skip

| Use | Skip |
|-----|------|
| worker/agent claimed "done" | pure design chat, no diff |
| pre-merge high stakes | typo you wrote yourself 30s ago (still run lint if easy) |
| security / auth / deps changes | |
| refute marketing claims in PR body | |

**vs Orch VERIFY:** Orch re-runs listed cmds and checks scope. **This skill** also opens files, greps wiring, hunts missing authz/tests, and writes a verdict artifact.  
**vs CG REVIEW_GATE:** CG is phase/budget control. **This skill** is the review *content* procedure for the review Role.

---

## Procedure

```text
1 Scope inventory → 2 Read shipped code → 3 Run verify cmds → 4 Attack claims → 5 Verdict artifact
```

### 1. Scope inventory

```bash
git diff <base>...HEAD --stat
git log <base>..HEAD --oneline
```

List claimed outcomes from brief/PR body.

### 2. Read shipped code

Open every file that implements a claim; grep wiring:

```bash
rg -n "pattern|approval|TODO|FIXME|XXX" --glob '!**/node_modules/**'
```

### 3. Run verify commands

From brief / AGENTS.md / CI — capture exit codes:

```bash
# examples — use project actuals
pnpm type-check && pnpm lint
cargo test -q
```

### 4. Attack claims

- Does diff match the claim?  
- Missing error paths, authz, cleanup?  
- Tests that don't exercise the change?  
- Secrets or overly broad permissions?

### 5. Verdict artifact

```markdown
## Adversarial verdict
**Claims reviewed:** …
**Evidence:** files read · cmds + exit
**Confirmed:** …
**Refuted / gaps:** …
**Risk:** low|med|high
**Decision:** pass | fix-required | blocked
```

---

## Done when

- [ ] Independent reads + at least one automated check (or documented why impossible)  
- [ ] Explicit pass/fail with gaps list  
- [ ] No merge recommendation on testimony alone  

## Anti-patterns

| ¬ | Do |
|---|-----|
| "LGTM" from PR text | open the files |
| same context that implemented | new review role / session |
| ignore failing tests | fail closed |
| duplicate full control-graph Outer | link CG; stay on evidence pack |

**Done_when cmds:** `git diff <base>...HEAD --stat` · project verify cmds · verdict markdown present.
