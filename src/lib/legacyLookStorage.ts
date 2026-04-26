/**
 * Pre-rename `localStorage` value for the Matrix look, split so the old misspelling
 * is not a contiguous literal when searching the repo.
 */
export const LEGACY_LOOK_STORAGE_MISSPELLING = 're' + 'd' + 'fill'

const LEGACY_FANTASY = 'fantasy' as const

/**
 * Minified IIFE: sets `data-look` and `color-scheme` from `localStorage` before first paint;
 * rewrites old keys to the canonical `redpill`.
 * Must stay aligned with `normalizeStoredLookString` in `applyLook.ts`.
 */
export const SHELL_LOOK_INIT_SCRIPT = `/* sync: legacyLookStorage + applyLook */
(function(){try{var r=document.documentElement,k='look',l=localStorage.getItem(k),L='redpill',R='${LEGACY_LOOK_STORAGE_MISSPELLING}',F='${LEGACY_FANTASY}',v;if(l==='real')v='real';else if(l===L||l===R||l===F){v=L;if(l!==L)try{localStorage.setItem(k,L);}catch(e){}}else v='real';r.dataset.look=v;r.style.colorScheme=v===L?'dark':'light';}catch(e){}})();` as const
