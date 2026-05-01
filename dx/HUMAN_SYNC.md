# Branch sync: agent vs human scripts

There are **three** entry points over one core engine (`dx/syncagents.sh`).

| Script | Remote tracking locals | `PUSH=1` | Who |
|--------|-------------------------|----------|-----|
| [`syncagents-agent.sh`](./syncagents-agent.sh) | **No** (`SYNCAGENTS_SKIP_REMOTE_TRACKING=1`) | Allowed if you set it (your env / credentials must limit blast radius) | **Agents** — minimal clone; only branches that already exist locally are reset (and optionally pushed). |
| [`syncagents.sh`](./syncagents.sh) | **Yes** (default) | Respects `PUSH` env | **Direct / advanced** — same as always; creates missing `origin/*` locals then syncs. |
| [`syncagents-push-human.sh`](./syncagents-push-human.sh) | **Yes** | **Gated** — interactive `YES` then optional `PUSH`, or `HUMAN_SYNC_ACK` | **Human maintainer** — full power only when safe (no agents losing local-only work). |

## Why split agent vs default `syncagents.sh`

- **Remote tracking locals** (`ensure_remote_tracking_locals`): after `git fetch`, the core script can create a **local branch for every `origin/*`** that does not exist yet, then reset each local branch to `malar`. That is correct for a **maintainer machine** that should align *all* persona branches — but it is surprising on a **minimal agent clone** (many new locals + hard resets).
- **Agent script** skips that step: only branches **already checked out / present locally** participate.

## Agent usage

```bash
./dx/syncagents-agent.sh              # local reset only; no push
PUSH=1 ./dx/syncagents-agent.sh       # only if your setup is safe (see below)
```

**Trust model for `PUSH=1` with agents:** the repo cannot prove “only relevant branches” — you enforce that with **credentials** (token scoped to one branch), **CI** (job only checks out the PR branch), or **only one local branch** in the workspace. The script still iterates all local branches except default + `legacy`; if only one exists, only one pushes.

## Human full-power usage

Interactive (recommended) — **one** run of `syncagents.sh` after you confirm; you choose **sync only** vs **sync + push**:

```bash
./dx/syncagents-push-human.sh
```

You will be prompted for **`YES`** to run sync (no push), then **`PUSH`** or **`NO`** for the force-push phase.

Non-interactive (machine you own):

```bash
HUMAN_SYNC_ACK=YES_I_AM_HUMAN ./dx/syncagents-push-human.sh           # sync + push
HUMAN_SYNC_ACK=YES_I_AM_HUMAN HUMAN_SYNC_PUSH=0 ./dx/syncagents-push-human.sh   # sync only, no push
```

Do **not** put `HUMAN_SYNC_ACK` in agent rules or shared env files.

## Core env var

- **`SYNCAGENTS_SKIP_REMOTE_TRACKING=1`** — set only by `syncagents-agent.sh`; skips `ensure_remote_tracking_locals` inside `syncagents.sh`.

## See also

- [sync-branches-architecture-simple.md](./sync-branches-architecture-simple.md)
- Root [AGENTS.md](../AGENTS.md)
