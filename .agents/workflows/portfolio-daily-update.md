---
name: portfolio-daily-update
description: End-to-end daily workflow that ingests recent commits into project sessions, verifies CI merges and local state, closes cards, and commits the resulting documentation.
kind: workflow
skill_chain: ["scan-portfolio-git-activity", "update-session-notes", "verify-and-close-card"]
---

# portfolio-daily-update

End-to-end daily workflow that ingests recent commits into project sessions, verifies CI merges and local state, closes cards, and commits the resulting documentation.

## Skill chain

1. `scan-portfolio-git-activity`
2. `update-session-notes`
3. `verify-and-close-card`

## Phases

### Explore

Glob projects and shell git activity since yesterday

### Document

Write/StrReplace 2026-07-15 session notes and project cards

### Verify

Shell sync checks, mark complete or defer

### Publish

Shell commit and push with summary

## Support

- sessions: 1
- rank: 29
