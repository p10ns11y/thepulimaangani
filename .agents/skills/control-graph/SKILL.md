---
name: control-graph
description: >-
  Agent control-plane as a graph: outer state machine (or cyclic loop) over
  named phases, nested inner DAGs or bounded sub-loops, hard budgets, HITL
  pause gates, and multi-model routing (fast/explore/coding/deep/review).
  Use for multi-step agent cycles, unbounded-ReAct risk, model routing,
  structured loops — not domain product logic. Formerly "looper". Composes
  with agent-orchestrator, subagent-delegation, fusion-sage, concurrent-cli-agents.
  Triggers: control-graph, looper, state machine, SM+DAG, loop card, model routing.
---

# control-graph

> **Load rule:** This file is the **formal SoT**. Expand [references/english-procedure.md](references/english-procedure.md) **only if** a symbol, phase, or transition is still ambiguous after this spec.

```text
// ── Signature ──────────────────────────────────────────────
CG          : control-graph (this skill)          // agent control plane procedure
Outer       : state machine | cyclic loop on Phases
Inner       : DAG | nested bounded loop
Phase ∈ { IDLE, ORIENT, PLAN, HITL_PLAN_GATE, EXECUTE,
          VERIFY, REPAIR, REVIEW_GATE, HITL_REVIEW,
          INTEGRATE, DONE, CANCELLED, BLOCKED }
Card        : Control Card (writable phase/budget/step surface)
Role ∈ { fast, explore, coding, deep, review }
HITL        : human-in-the-loop gate
HOOTL       : human-out-of-the-loop (auto-clear only when safe)
Budget      : { max_loop_iters, max_repair_rounds, max_step_retries,
                max_tool_calls_per_step, no_progress, wall_clock? }

// ── Axioms (never violate) ─────────────────────────────────
A1  Outer is explicit on Card  — never only in chat memory
A2  EXECUTE ⊆ finite Inner     — no open-ended ReAct
A3  Progress ≔ new evidence (diff | test | decision) on Card
A4  Budget exhaust ∨ no_progress×2  →  STOP | HITL | re-PLAN  (never silent thrash)
A5  Review ⊥ ImplementerContext     // fresh inputs: plan + diff + logs
A6  Domain skills ⊨ data plane;  CG ⊨ control plane only
A7  Evaluate(δ) ≔ (Correctness, Effectiveness, Efficiency)

// ── Mission ────────────────────────────────────────────────
Keep agent creativity, wrap it in deterministic skeleton:
  Outer(phase, transition, HITL) + Inner(DAG|subloop, done_when, retry)
```

## Activate / Skip

| Signal | Action |
|--------|--------|
| multi-step · thrash risk · “until done” · model routing · parallel re-entry | load CG; open **Card** |
| “control-graph”, “looper”, “state machine”, “SM+DAG”, “loop card” | full skill |
| domain autonomy (finder / CV / X) | domain skill owns domain; CG owns **shape only** |
| ≤1–2 files, obvious fix | **Skip** → [agent-orchestrator](../agent-orchestrator/SKILL.md) triage only |

---

## Outer graph (state machine / loop)

```text
                    ┌──────────────┐
                    │    IDLE      │
                    └──────┬───────┘
                           │ goal accepted
                           ▼
                    ┌──────────────┐
              ┌────►│   ORIENT     │◄── resume / re-orient
              │     └──────┬───────┘
              │            ▼
              │     ┌──────────────┐
              │     │    PLAN      │──► HITL_PLAN_GATE?
              │     └──────┬───────┘
              │            ▼
              │     ┌──────────────┐     Inner DAG / nested loop
              │     │   EXECUTE    │◄────────────────────────┐
              │     └──────┬───────┘                         │
              │            ▼                                 │
              │     ┌──────────────┐  fail+budget      ┌─────┴──────┐
              │     │   VERIFY     │──────────────────►│   REPAIR   │
              │     └──────┬───────┘                   └────────────┘
              │            │ pass
              │            ▼
              │     ┌──────────────┐
              │     │ REVIEW_GATE  │──► HITL_REVIEW?
              │     └──────┬───────┘
              │            ▼
              │     ┌──────────────┐
              │     │  INTEGRATE   │
              │     └──────┬───────┘
              │     more?──yes──► PLAN (gap only)
              │            │ no
              │            ▼
              │     ┌──────────────┐
              └─────│ DONE | CANCELLED | BLOCKED
                    └──────────────┘
```

### Phase contract

| Phase | Purpose | Exit when | Default Role |
|-------|---------|-----------|--------------|
| IDLE | no active graph | goal accepted | — |
| ORIENT | goal · constraints · risks · skills | 1-sentence goal + unknowns | fast \| explore |
| PLAN | steps · verify cmds · budgets | written plan + success criteria | deep (or fast if light) |
| HITL_PLAN_GATE | human on risky/vague plan | approve \| amend \| abort | human |
| EXECUTE | run **only** Inner batch | batch done \| step retries exhausted | coding \| fast |
| VERIFY | independent checks vs plan | all verify cmds run; pass/fail known | fast + review on fail |
| REPAIR | gap-only fix | gap closed \| repair budget 0 | coding |
| REVIEW_GATE | quality/safety/scope | pass \| HITL \| rework | review |
| HITL_REVIEW | high-stakes human | approve \| reject \| redirect | human |
| INTEGRATE | merge · report · surplus | artifacts landed | fast |
| DONE / CANCELLED / BLOCKED | terminal | reason on Card | — |

### Transitions (guards)

| From → To | Guard |
|-----------|-------|
| IDLE → ORIENT | non-trivial goal \| explicit run |
| ORIENT → PLAN | goal + constraints on Card |
| PLAN → EXECUTE | success criteria + verify cmds (or light exception) |
| PLAN → HITL_PLAN_GATE | high stakes \| vague \| destructive \| user asked |
| HITL_PLAN_GATE → {PLAN, EXECUTE, CANCELLED} | amend \| approve \| abort |
| EXECUTE → VERIFY | Inner batch finished |
| VERIFY → INTEGRATE | all checks pass |
| VERIFY → REPAIR | fail ∧ repair_budget > 0 |
| VERIFY → BLOCKED | fail ∧ (budget 0 ∨ external) |
| REPAIR → VERIFY | fix applied |
| REPAIR → PLAN | plan wrong (remaining only) |
| INTEGRATE → DONE | no remaining in-scope work |
| INTEGRATE → PLAN | remaining gap only |
| Any → HITL_* | cost/rate/fit/safety/confidence \| phase requires human |
| Any → CANCELLED | user cancel \| hard policy \| max_loop_iters ∧ ¬progress |
| Any → BLOCKED | credentials/network/permissions after ≥2 attempts |

### Budgets (defaults — set on Card before EXECUTE)

| Budget | Default | On exhaust |
|--------|---------|------------|
| `max_loop_iters` | 8 | STOP + report |
| `max_repair_rounds` | 3 | STOP \| HITL |
| `max_step_retries` | 2 | mark step failed; siblings or abort batch |
| `max_tool_calls_per_step` | 25 | force step exit |
| `no_progress` | 2 identical failure signatures | re-PLAN \| HITL |

---

## Inner graph (DAG | nested loop)

∀ step in EXECUTE batch:

```text
id, name, depends_on[], done_when, retry ∈ 0..max_step_retries,
on_fail ∈ { abort_batch, continue_siblings, escalate_HITL },
cancel_when, model_role, inputs (minimal), outputs (re-enter Outer)
```

**Rules**

1. Bound first — write step list before tools; default ≤7 steps/batch  
2. One primary outcome per step  
3. Parallel ⇔ independent paths → [concurrent-cli-agents](../concurrent-cli-agents/SKILL.md) + [subagent-delegation](../subagent-delegation/SKILL.md)  
4. Re-enter Outer with `{step_id, status, artifacts, errors, next_hint}` — not full transcript  
5. Nested loop allowed only if it inherits budgets + `done_when` (no nested unbounded ReAct)  
6. Cancel is first-class — leave tree consistent; reason on Card  

```text
EXECUTE → topo(Inner) | parallel(independent)
       → ∀ step: until done_when | retry | fail
       → aggregate → VERIFY
```

---

## Model routing

| Role | Use | Re-enters Outer as |
|------|-----|--------------------|
| **fast** | orient, triage, cmds, small edits, Card updates | facts, pass/fail |
| **explore** | broad map, readonly survey | structured map |
| **coding** | implement fixed step contract | diff + how verified |
| **deep** | architecture, ambiguous plan, tradeoffs | plan / decision |
| **review** | independent verify / security / scope | pass/fail + gaps only |

| Signal | Prefer | Avoid |
|--------|--------|-------|
| ≤2-file obvious | fast (skip full CG) | deep / multi-agent |
| “explore thoroughly” | explore → ORIENT→PLAN | coding before map |
| clear acceptance | coding | mid-step re-architecture |
| vague large / design | deep in PLAN (+HITL?) | coding immediately |
| worker claimed done | **review** (fresh) | same implementer context |
| high stakes (secrets, prod, CV) | review + HITL | unattended coding |

Single-model host: simulate roles via phase prompts; **reset context** for review.

**Handoff:** `phase, step_id, status, artifacts[], verify_commands[], open_risks[]`  
Parent Outer **owns** transitions. Workers never jump PLAN→DONE.

---

## HITL gates

Pause (no further EXECUTE side effects) when any:

| Gate | Trigger | Resume |
|------|---------|--------|
| Plan | vague/large/high-stakes | approve / amend |
| Review | security, external mutate, irreversible git, CV/live | confirm |
| Budget | max_* exhausted \| cost limit | raise budget / cancel |
| Confidence | low confidence / contradiction | decide / re-ORIENT |
| Policy | secrets, destructive, shared remote push | confirm |
| Blocker | missing creds/permissions | fix env / CANCELLED |

Domain guards stay in domain skills; CG requires honoring pause results as Outer transitions.

---

## Composition (no duplication)

| Concern | Owner | CG does |
|---------|-------|---------|
| triage single-shot vs multi-worker | [agent-orchestrator](../agent-orchestrator/SKILL.md) | wrap work in Outer phases |
| explore return format | [subagent-delegation](../subagent-delegation/SKILL.md) | explore Role + Inner steps |
| worktrees / merge | [git-worktrees](../git-worktrees/SKILL.md) | INTEGRATE uses merge, not `cp` |
| parallel agents | [concurrent-cli-agents](../concurrent-cli-agents/SKILL.md) | independent Inner only |
| token prune | [ai-optimization](../ai-optimization/SKILL.md) | before deep/coding fill |
| surplus | [fusion-sage](../fusion-sage/SKILL.md) | PLAN/INTEGRATE surplus |
| product autonomy | finder-reactor / agentic-reactor | **shape only** |

`CG = control plane` · domain = data plane · orchestrator = multi-worker logistics.

---

## Anti-patterns

| ¬ | Do |
|---|-----|
| unbounded ReAct until “feels done” | Outer + budgets + `done_when` |
| phase only in chat rambling | Control Card |
| one model plan+code+self-review | separate **review** (fresh) |
| mega-step “implement everything” | small Inner DAG |
| retry same failure forever | `no_progress` → re-PLAN \| HITL |
| nested agents without parent ownership | parent owns transitions |
| domain logic reimplemented here | link domain skills |
| silent continue after budget exhaust | STOP + report |

---

## Control Card (minimum)

Copy [references/control-card.md](references/control-card.md) or:

```markdown
## Control Card
- goal: …
- phase: ORIENT | PLAN | EXECUTE | VERIFY | REPAIR | REVIEW_GATE | INTEGRATE | HITL_* | DONE | …
- plan (success criteria): …
- verify commands: …
- budgets: max_loop_iters=8 rem=_; max_repair_rounds=3 rem=_; max_step_retries=2
- steps (DAG|subloop): S1 … / depends / done_when / role
- model_role now: fast | explore | coding | deep | review
- last progress: …
- pause reason: (none | …)
- handoff: artifacts / open_risks
```

Update Card on **every** phase transition. If phase unnameable → unbounded ReAct → stop → ORIENT.

---

## Quick procedure

```text
1. Triage (agent-orchestrator): single-shot? → do it; skip CG
2. Open Card; phase=ORIENT; set budgets
3. PLAN + verify cmds; HITL if high stakes
4. Route Role; write Inner DAG|subloop
5. EXECUTE bounded; handoffs only
6. VERIFY real cmds; REPAIR gaps only (budgeted)
7. REVIEW_GATE / HITL when required
8. INTEGRATE + report; surplus if fusion applies
9. DONE or narrow re-PLAN for remaining gap only
```

---

## Portable wiring

| Env | Load |
|-----|------|
| Grok / Cursor / AGENTS.md | description match · `/control-graph` · “looper” alias |
| Cursor rule | [../rules/control-graph.mdc](../rules/control-graph.mdc) |
| Validate | `node control-graph/scripts/validate-skill.mjs` |

**Rename note:** formerly `looper`. Same contract; name matches Outer SM/loop + Inner DAG/nested-loop graph.

## Reference (progressive disclosure)

- **English expansion (only if needed):** [references/english-procedure.md](references/english-procedure.md)
- **Card template:** [references/control-card.md](references/control-card.md)
- **Library formal kernel:** [../formal/AppGenMathPhyLang.kernel.md](../formal/AppGenMathPhyLang.kernel.md)
- **Thesis:** [@Peramanathan structured loops](https://x.com/Peramanathan/status/2067890630345494578)

**Creativity inside the edges — never instead of them.**
