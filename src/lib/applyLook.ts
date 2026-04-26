import type { AppLook } from '#/machines/app.machine'

/** `localStorage` key for persisted look (FOUC script + `AppShellSync` must match). */
export const LOOK_STORAGE_KEY = 'look' as const

/**
 * Sets the DOM contract for shell look: `data-look` on `<html>` and
 * `color-scheme` so native scrollbars/controls match the fixed palette.
 */
export function applyLook(look: AppLook, root: HTMLElement = document.documentElement): void {
  root.dataset.look = look
  root.style.colorScheme = look === 'redfill' ? 'dark' : 'light'
}

/** Legacy `fantasy` in storage maps to `redfill` (renamed in UI, same palette). */
export function normalizeStoredLookString(v: string | null): AppLook {
  if (v === 'real' || v === 'redfill') return v
  if (v === 'fantasy') return 'redfill'
  return 'real'
}
