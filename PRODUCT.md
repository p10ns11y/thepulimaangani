# Product

## Register

product

## Users

Tamil learners, poets, and prosody students reading or checking யாப்பு (metre) in the browser. Secondary users: developers and ML researchers iterating on the hybrid metre path — they need technical detail, not as the default surface.

## Product Purpose

Help people understand Tamil poem structure (அசை · சீர் · தளை · அடி · metre) from live parse results. Success: a learner can open a sample or their own text and quickly see metre, bonds, and syllables without ML jargon. Statistical estimates stay honest (“not classical proof”) without dumping training metrics.

## Brand Personality

Calm, scholarly, bilingual (Tamil + English), precise. Quiet craft over dashboard spectacle.

## Anti-references

- ML ops dashboards (loss curves, epoch counts, Acc/F1 walls)
- SaaS metric card grids and hero-stat templates
- Nested cards of engineer-only IDs (`dense_logistic`, ADOPT freezes) on the primary path
- Jargon-first copy that assumes gradient descent literacy

## Design Principles

1. **Learners first** — default UI answers “what metre is this?” not “how was the model fitted?”
2. **Honest uncertainty** — never fake calibrated %; prefer plain certainty language, with numbers in progressive disclosure
3. **Progressive disclosure** — multi-head votes, dense features, freeze dates, and ADOPT notes live behind an explicit “Technical notes” entry
4. **Classical and statistical stay parallel** — dual-truth is a soft sketch, never fused into one fake score
5. **Breathe** — density for syllables and bonds is fine; ML detail must not compete with that hierarchy

## Accessibility & Inclusion

Aim for WCAG 2.2 AA on interactive controls. Preserve `prefers-reduced-motion`. Keep Tamil readable at body size; avoid all-caps Latin labels on bilingual UI. Tooltips/details must be keyboard-reachable (native `details`/`summary` preferred).
