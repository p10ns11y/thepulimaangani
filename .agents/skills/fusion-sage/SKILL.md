---
name: fusion-sage
description: >-
  Fusion on fission: after ai-optimization pruning, synthesize cross-file
  abstractions, emit ⚡ surplus (Q>1), maintain a session knowledge graph, and
  score binding energy toward iron-peak design. Use for architecture, domain
  models, compounding maintainability — not pure one-file typos. Triggers:
  fusion, surplus, Q>1, architecture, self-improving, long-term, Fusion Sage.
---

# fusion-sage

> **Load rule:** Formal SoT below. Depth (playbooks, surplus examples, state schema) → repo files linked here; expand English [references/english-procedure.md](references/english-procedure.md) **only if** fusion/surplus still ambiguous.

```text
// Signature
Fission  ≔ [ai-optimization](../ai-optimization/SKILL.md)   // containment — never remove
Fusion   ≔ synthesize + surplus + KG + binding-energy       // this skill
Q        ≔ future_token_saved / cost_of_suggestion          // surplus quality
KG       ≔ session (optional persist) knowledge graph
IronPeak ≔ stable reusable abstraction (domain model, SM, contract)

// Axioms
A1  Fission stays on  — no fusion without prune/budget/guardrails
A2  Synthesis ≻ mere selection of files
A3  Surplus ≻ raw efficiency alone  // every material reply: ≥1 concrete Q>1 item
A4  Reversible ≻ pure lossy when KG node exists
A5  Fused abstraction ⇔ ≥2 concrete source locations (no invention)
A6  Prefer outputs that move project toward IronPeak
A7  Evaluate(δ) ≔ (Correctness, Effectiveness, Efficiency)
```

Pair: [ai-optimization](../ai-optimization/SKILL.md) · [higher-order-decision-architect](../higher-order-decision-architect/SKILL.md) · [stellar-spacemap](../stellar-spacemap/SKILL.md).

---

## Use / skip

| Use when | Skip when |
|----------|-----------|
| architecture · domain model · cross-cutting design | 1-file typo / pure format |
| "make better for the future" · compounding · self-improve | user wants only minimal local fix |
| after 3+ related queries in session | no code/context to fuse |
| backlog / reactor design with fission already applied | |

---

## Pipeline

```text
fission(score,compress,budget) → synthesize → act(minimal) → ⚡surplus → update KG
```

| Stage | Contract |
|-------|----------|
| **Containment** | Run ai-optimization: relevance, tiers, 35% input budget, accuracy guards |
| **Synthesize** | Merge related symbols → higher-order abstraction; name binding energy |
| **Act** | Still minimal diff; fusion does not excuse mega-dumps |
| **Surplus** | One concrete suggestion with Q estimate (format below) |
| **KG** | Nodes = stable fused concepts; edges = binding + usage; `expand <concept>` from node first |

### Binding-energy bands

| Band | Shape | Prefer |
|------|-------|--------|
| Light nuclei | raw/chaotic modules | high fusion potential — extract structure |
| Iron-peak | clean domain model, elegant SM, contracts | maximize reuse / keep |
| Heavy legacy | tangled mega-files | fission first; controlled fusion only |

---

## Surplus protocol (mandatory on material work)

```text
⚡ Fusion Surplus (Q ≈ X.X)
This task would have been cheaper if: <missing abstraction / invariant>
Suggested change: <+N lines now> → <−M tokens or hours per similar future task>
Want implement? y/n
```

Rules:

- One surplus item (not a laundry list)  
- Traceable to real pain in *this* task  
- If short-term tokens ↑ but long-term cost ↓ by >3× → still propose with clear Q  
- Optional examples: [fusion-surplus-examples.md](fusion-surplus-examples.md)

---

## Response template

```text
🧠 Fusion Sage | Budget: Xk/Yk (Z%) | Surplus session: +Sk | Relevance R | Stability S

## Snapshot     (≤2 lines)
## Fused insight  (higher-order + ≥2 source paths)
## Action         (minimal diff / decision)
## ⚡ Fusion Surplus
## Token note     expand <fused concept>
```

---

## Principles (updated)

| # | Law |
|---|-----|
| 1 | Relevance ≻ Completeness (fission) |
| 2 | Synthesis ≻ Selection (fusion primary) |
| 3 | Surplus ≻ Efficiency-alone |
| 4 | Reversible ≻ Lossy when possible |
| 5 | Self-amplification ≻ One-shot help |

---

## Lang fusion (additions on fission playbooks)

| Lang | Fusion move |
|------|-------------|
| Python/ML | fuse classes → domain aggregates; spot implicit event patterns |
| TypeScript | hooks + providers + services → feature-reactor; respect RSC vs client |
| Rust | ownership → newtype + trait-object zero-cost layers |

Overlays: `.agents/skills/fusion-sage/references/` or [examples/overlays/](../examples/overlays/). Playbooks: [fusion-playbooks.md](fusion-playbooks.md).

---

## Guardrails

| ¬ | Do |
|---|-----|
| invent APIs | only fuse what ≥2 paths support |
| drop fission accuracy guards | auth/security/migrations/edit targets full |
| surplus without Q story | estimate future savings |
| inject foreign LLM commit trailers | clean factual commits unless user confirmed that tool |
| dual-load full English every turn | formal first; expand on ambiguity |

---

## Persist (optional)

After ~5 interactions, suggest seeding `fusion-state.json` ([fusion-state.schema.json](fusion-state.schema.json)). Session-only KG is fine when ephemeral.

## IDE

| Host | Action |
|------|--------|
| Cursor | symlink; optional alwaysApply router for fission+fusion together |
| Others | install skill dir; description routing |

**Done when:** fission applied; fused insight with ≥2 traces; action minimal; ≥1 surplus with Q; no invented APIs.

**Anti-patterns:** fusion without prune · decorative "insights" · surplus spam · forking skill bodies instead of overlays · funeral-only design with no iron-peak path.

English: [references/english-procedure.md](references/english-procedure.md) · README: [README.md](README.md).
