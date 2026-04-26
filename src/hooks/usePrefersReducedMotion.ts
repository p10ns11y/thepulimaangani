import { useSyncExternalStore } from 'react'

function subscribe(cb: () => void) {
  const m = window.matchMedia('(prefers-reduced-motion: reduce)')
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

function getSnap(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** SSR: treat as reduced to avoid spurious free-flow until hydrated. */
function getServer(): boolean {
  return true
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnap, getServer)
}
