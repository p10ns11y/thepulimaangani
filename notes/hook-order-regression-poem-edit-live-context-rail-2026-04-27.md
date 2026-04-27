# Hook-Order Regression: PoemEditLiveContextRail (2026-04-27)

## Incident summary

- Symptom: runtime crash in editor flow with:
  - `Rendered fewer hooks than expected`
  - error surfaced from `PoemEditLiveContextRail`
- User-facing impact: React error boundary recovered tree; editor-related preview rail could fail during state transitions.

## Root cause

In `src/components/prosody/PoemEditLiveContextRail.tsx`, an early `return null` executed before all hooks when there were zero physical lines.

On later renders (when lines existed), additional hooks ran (`useCallback`, `useTypewriterPaperPhysics`), causing hook order mismatch between renders.

## Fix

- Removed pre-hook early return path.
- Introduced `hasLines` guard and empty-safe `visibleLines` computation.
- Kept hook execution order stable across all renders.
- Returned `null` only after hooks are initialized.

## Files changed

- `src/components/prosody/PoemEditLiveContextRail.tsx`

## Validation

- `pnpm run typecheck` passed.
- `pnpm run test:frontend` passed.

## Commit reference

- `d659622` — `fix: resolve hook-order regression in live context rail`
