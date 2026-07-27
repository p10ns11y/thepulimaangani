---
name: proceed-incrementally
description: Continue an in-flight plan when user says proceed, go ahead, or do that. Use after CreatePlan, TodoWrite, or a multi-step refactor — do not restart exploration.
---

# Proceed incrementally

## When to use

- User says **"proceed"**, **"go ahead"**, **"do that"**, **"continue"** mid-session
- TodoWrite or plan already exists; prior turn started implementation
- High tool-count thread (20–60+ tools) — user wants forward motion, not re-discovery

## Steps

1. **Read** TodoWrite state / last assistant summary — identify the next incomplete item only.
2. Do **not** re-Glob the whole repo unless the plan step requires new files.
3. Execute **one plan step**: Read → patch → Shell → ReadLints.
4. Update todo status; report what finished and what is next in one short paragraph.

## Anti-patterns (from dropped/noisy turns)

- Restarting "explore the repo" when user said proceed
- Asking clarifying questions already answered in the plan attachment
- Large unsolicited refactors outside the current todo item

## Done when

Current todo item is verified (Shell/ReadLints) and next item is named — or user is told the plan is complete.
