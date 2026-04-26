import type { AppLook } from '#/machines/app.machine'

/** `localStorage` key for persisted look (FOUC script + `AppShellSync` must match). */
export const LOOK_STORAGE_KEY = 'look' as const

/**
 * Sets the DOM contract for shell look: `data-look` on `<html>` and
 * `color-scheme` so native scrollbars/controls match the fixed palette.
 */
export function applyLook(look: AppLook, root: HTMLElement = document.documentElement): void {
  root.dataset.look = look
  root.style.colorScheme = look === 'fantasy' ? 'dark' : 'light'
}
