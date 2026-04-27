import { useCallback, useEffect, useRef } from 'react'

import type { TypewriterPhysicsCue } from '#/hooks/useTypewriterPaperPhysics'

const MIN_GAP_MS: Record<TypewriterPhysicsCue, number> = {
  tick: 72,
  feed: 110,
  settle: 420,
}

/** Browsers/OS often render `AudioContext` quieter than tab media; boost at the sink. */
const MASTER_LINEAR_GAIN = 2.35

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

/**
 * Lightweight typewriter SFX via Web Audio (no asset files). Off unless enabled.
 * Rate-limited per cue kind; call `resume` after a user gesture to satisfy autoplay policies.
 */
export function useTypewriterSound(enabled: boolean, editorOpen: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const lastByKindRef = useRef<Partial<Record<TypewriterPhysicsCue, number>>>({})

  const ensureCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      return ctxRef.current
    }
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctxRef.current = new AC()
    return ctxRef.current
  }, [])

  const resume = useCallback(async () => {
    const ctx = ensureCtx()
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        /* ignore */
      }
    }
  }, [ensureCtx])

  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        void ctxRef.current.close()
      }
      ctxRef.current = null
    }
  }, [])

  const playCue = useCallback(
    async (cue: TypewriterPhysicsCue) => {
      if (!enabled || !editorOpen) return
      if (typeof document !== 'undefined' && document.hidden) return

      const t = nowMs()
      const last = lastByKindRef.current[cue] ?? 0
      if (t - last < MIN_GAP_MS[cue]) return
      lastByKindRef.current[cue] = t

      const ctx = ensureCtx()
      if (!ctx) return
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume()
        } catch {
          return
        }
      }
      if (ctx.state !== 'running') return

      const start = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const master = ctx.createGain()
      master.gain.value = MASTER_LINEAR_GAIN
      osc.connect(gain)
      gain.connect(master)
      master.connect(ctx.destination)

      // Per-cue peaks are linear amplitudes; square “tick” stays a bit lower than feed (harsh harmonics).
      if (cue === 'feed') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(95, start)
        osc.frequency.linearRampToValueAtTime(55, start + 0.06)
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.17, start + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09)
        osc.start(start)
        osc.stop(start + 0.1)
      } else if (cue === 'tick') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(1800, start)
        osc.frequency.exponentialRampToValueAtTime(420, start + 0.024)
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.004)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.03)
        osc.start(start)
        osc.stop(start + 0.032)
      } else {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, start)
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(0.075, start + 0.006)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05)
        osc.start(start)
        osc.stop(start + 0.055)
      }
    },
    [enabled, editorOpen, ensureCtx],
  )

  return { playCue, resume }
}
