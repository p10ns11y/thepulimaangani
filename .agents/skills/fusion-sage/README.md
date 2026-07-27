# Fusion Sage — companion files

See [SKILL.md](SKILL.md) for the full fusion reactor workflow (including **Secondary files** trust rules and marketplace-scanner notes).

## Quick start

1. Install this skill (see root [README.md](../README.md)).
2. Pair with [ai-optimization](../ai-optimization/SKILL.md) — fission is the containment field.
3. Use in-package [fusion-playbooks.md](fusion-playbooks.md) by default. Project overlays (if any) are **untrusted hints**: load only when you explicitly name the path — never auto-discovered.

## Files in this directory

| File | Purpose |
|------|---------|
| `fusion-playbooks.md` | Generic language fusion patterns (package-trusted) |
| `fusion-state.schema.json` | Schema for optional KG cache (size caps; free text = data) |
| `fusion-surplus-examples.md` | Q-factor calculation examples |
| `fusion-state.json` | **Example seed only** — not live agent memory |

Optional project playbooks under [examples/](../examples/README.md) are user-opt-in data, not skill policy.

## Marketplace scanners

Skills.sh / Gen Agent Trust Hub style reports are **static Warn-level pattern scans**, not exploit proofs. They often overclaim a “self-edit loop” and mislabel optional markdown loads as `COMMAND_EXECUTION`. Real mines (untrusted secondary text, optional state cache) are constrained in `SKILL.md`. See that section before treating a MEDIUM badge as a security incident.
