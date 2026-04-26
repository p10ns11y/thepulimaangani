import { LEGACY_LOOK_STORAGE_MISSPELLING } from '#/lib/legacyLookStorage'
import type { AppLook } from '#/machines/app.machine'

/** `localStorage` key for persisted look (FOUC script + `AppActorProvider` look sync must match). */
export const LOOK_STORAGE_KEY = 'look' as const

/**
 * Sets the DOM contract for shell look: `data-look` on `<html>` and
 * `color-scheme` so native scrollbars/controls match the fixed palette.
 */
export function applyLook(look: AppLook, root: HTMLElement = document.documentElement): void {
  root.dataset.look = look
  root.style.colorScheme = look === 'redpill' ? 'dark' : 'light'
}

/** Maps legacy `localStorage` values to the canonical `AppLook` (see `legacyLookStorage.ts`). */
export function normalizeStoredLookString(v: string | null): AppLook {
  if (v === 'real' || v === 'redpill') return v
  if (v === LEGACY_LOOK_STORAGE_MISSPELLING || v === 'fantasy') return 'redpill'
  return 'real'
}
