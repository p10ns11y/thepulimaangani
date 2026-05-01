# Human-gated branch push (post-merge sync)

## Why this exists

Role branches and **open PR heads** are safer when routine automation only **aligns local clones** to `origin/malar` and does **not** rewrite remote tips. **Force-pushing** many branches after a hard reset is easy to run from a sandbox by mistake and can disrupt anyone tracking those branches.

So:

| Script | `PUSH` | Who runs it |
|--------|--------|-------------|
| [`syncagents.sh`](./syncagents.sh) | **off** (default) | **Anyone** — agents, contributors. Safe: local reset only unless you export `PUSH=1`. |
| [`syncagents-push-human.sh`](./syncagents-push-human.sh) | **on** | **Human maintainer / creator** — interactive confirmation, or explicit `HUMAN_SYNC_ACK` (see script header). |

This matches review feedback (e.g. PR **#55**): keep the **safe** flow in the main script; move **destructive push** behind a separate entry point that is awkward for agents to invoke accidentally.

## What agents should do

From repo root, after merging a PR:

```bash
./dx/syncagents.sh
```

Do **not** set `PUSH=1` in agent instructions or cloud agent env unless the product owner explicitly wants that session to rewrite remotes.

## What humans do when remotes must match `malar`

Interactive (recommended):

```bash
./dx/syncagents-push-human.sh
```

Non-interactive (only on a machine **you** control):

```bash
HUMAN_SYNC_ACK=YES_I_AM_HUMAN ./dx/syncagents-push-human.sh
```

## Stronger gates (optional)

If you need more than filename + banner + typed `YES`:

- Run the human script **only** from a specific workstation or over **SSH** with a normal shell (agents rarely have your keys).
- Add **`git config`** checks (e.g. require `user.email` to match a maintainer domain) inside a **private** wrapper that is **not** committed, or keep it in a dotfiles repo.
- **`gpg --clearsign`** a small “intent to sync” file and verify before push — high friction, rarely worth it for this repo unless you are under attack.

No single check is proof against a malicious agent with full shell access; the goal is **accidental** push prevention and clear **policy** in docs.

## See also

- [sync-branches-architecture-simple.md](./sync-branches-architecture-simple.md) — state machine for `syncagents.sh`
- Root [AGENTS.md](../AGENTS.md) — branch sync policy
