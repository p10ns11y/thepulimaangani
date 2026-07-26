---
name: poem-variations-constant-refactor
description: Refactor poem data file to use single-source named constants, eliminate duplicate example rows, and keep alternates as comments
kind: workflow
skill_chain: ["introduce-named-constants", "one-sample-per-type", "derive-example-key-mirror"]
---

# poem-variations-constant-refactor

Refactor poem data file to use single-source named constants, eliminate duplicate example rows, and keep alternates as comments

## Skill chain

1. `introduce-named-constants`
2. `one-sample-per-type`
3. `derive-example-key-mirror`

## Phases

### Explore

ReadFile + rg to locate 7 broken references and duplicate en values

### Normalize Keys

Introduce consts + tamilKeys map + variationRow helper

### Consolidate

Reduce to one row per type and archive extras

### Verify

Shell + ReadLints to confirm no lint or runtime issues

## Support

- sessions: 1
- rank: 29
