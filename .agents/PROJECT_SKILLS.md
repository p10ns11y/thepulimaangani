# Project skills policy (thepulimaangani)

**Source of truth for remote pack:** https://github.com/p10ns11y/skills · catalog: https://skills.sh/p10ns11y/skills

**Principle:** Prefer **workflows** (`.grok/workflows/`) over large always-loaded skills. Skills here are a **lean pack** only.

## Installed (keep)

### From `p10ns11y/skills` (via `npx skills add`)

| Skill | Why |
|-------|-----|
| `ai-optimization` | Token/context discipline on Rust+TS monorepo |
| `architecture-synthesis` | Architecture synthesis after fission (preferred; was fusion-sage) |
| `fusion-sage` | Legacy alias — prefer architecture-synthesis |
| `control-graph` | Bounded multi-step agent loops |
| `agent-orchestrator` | Triage single-shot vs multi-agent |
| `adversarial-audit` | Evidence before “done” / PR quality |
| `higher-order-decision-architect` | Non-trivial design tradeoffs |
| `react-client-expert` | ProsodyLab React/XState client work |
| `stellar-spacemap` | Backlog / coming-next after PRs |
| `peram_senior_mlai_engineer` | Senior ML/AI engineering for metre/parser ML |

### Local thin explorers (keep)

| Skill | Why |
|-------|-----|
| `explore-then-edit` | Map before edit |
| `structured-repo-explore` | Systematic explore |
| `proceed-incrementally` | Continue plans without re-explore |
| `subagent-delegation` | Bounded explore subagents |

## Do not install here

Chrome extensions, Tauri desktop, Solana, MongoDB, shell-kernel ontology, skill-author meta, CV guards — keep **global** if you need them, not in this repo.

## Refresh

```bash
npx skills add p10ns11y/skills \
  -s ai-optimization -s architecture-synthesis -s fusion-sage -s control-graph \
  -s adversarial-audit -s higher-order-decision-architect \
  -s react-client-expert -s stellar-spacemap -s agent-orchestrator \
  -s peram_senior_mlai_engineer \
  -a '*' -y
npx skills update -p -y
```

## Workflows first

| Workflow | Purpose |
|----------|---------|
| `metre-ml-tier-and-ui` | Metre ML + UI progression |
| `metre-ml-tier-progression` | SOA / tier steps |

