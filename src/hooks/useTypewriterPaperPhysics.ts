import { useEffect, useRef, useState } from 'react'

export type PaperPhysicsTransform = {
  translateY: number
  rotateZ: number
  scale: number
}

export type TypewriterPhysicsCue = 'feed' | 'tick' | 'settle'

type UseTypewriterPaperPhysicsArgs = {
  /** Paper spring motion (transform). */
  enabled: boolean
  /** Emit `onPhysicsCue` for typewriter SFX; independent of `enabled` so sound can stay on without motion. */
  cuesEnabled: boolean
  reducedMotion: boolean
  editorOpen: boolean
  focusLine: number
  layoutVersion: number
  liveStatus: string
  activeLineSyllableCount: number
  /** Optional SFX layer; kept stable via ref inside hook. */
  onPhysicsCue?: (cue: TypewriterPhysicsCue) => void
}

/**
 * Typewriter paper: spring to rest + impulses on line/layout/syllable events.
 * rAF loop runs only while motion is active (settles to idle for battery).
 */
export function useTypewriterPaperPhysics({
  enabled,
  cuesEnabled,
  reducedMotion,
  editorOpen,
  focusLine,
  layoutVersion,
  liveStatus,
  activeLineSyllableCount,
  onPhysicsCue,
}: UseTypewriterPaperPhysicsArgs): PaperPhysicsTransform {
  const [transform, setTransform] = useState<PaperPhysicsTransform>({
    translateY: 0,
    rotateZ: 0,
    scale: 1,
  })

  const yRef = useRef(0)
  const vyRef = useRef(0)
  const rotRef = useRef(0)
  const vrRef = useRef(0)
  const jitterRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const motionSeenRef = useRef(false)

  const prevLineRef = useRef(focusLine)
  const prevLayoutRef = useRef(layoutVersion)
  const prevSylRef = useRef(activeLineSyllableCount)
  const prevStatusRef = useRef(liveStatus)

  const kickVyRef = useRef(0)
  const kickVrRef = useRef(0)
  const kickJitterRef = useRef(0)
  const settleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cueRef = useRef(onPhysicsCue)
  cueRef.current = onPhysicsCue
  const cuesEnabledRef = useRef(cuesEnabled)
  cuesEnabledRef.current = cuesEnabled

  // Apply one-shot impulses when inputs change (does not own rAF lifecycle).
  // Cues (sound) can run without `enabled` (paper motion).
  useEffect(() => {
    if (!editorOpen || reducedMotion) {
      prevLineRef.current = focusLine
      prevLayoutRef.current = layoutVersion
      prevSylRef.current = activeLineSyllableCount
      prevStatusRef.current = liveStatus
      return
    }

    const motionOn = enabled
    const cuesOn = cuesEnabled

    if (!motionOn && !cuesOn) {
      prevLineRef.current = focusLine
      prevLayoutRef.current = layoutVersion
      prevSylRef.current = activeLineSyllableCount
      prevStatusRef.current = liveStatus
      return
    }

    const scheduleSettleForSoundOnly = () => {
      if (motionOn || !cuesOn) return
      if (settleDebounceRef.current) clearTimeout(settleDebounceRef.current)
      settleDebounceRef.current = setTimeout(() => {
        settleDebounceRef.current = null
        cueRef.current?.('settle')
      }, 135)
    }

    const LINE_IMPULSE = 3.2
    const LAYOUT_NUDGE = 1.1

    if (focusLine !== prevLineRef.current) {
      if (motionOn) {
        const dir = focusLine > prevLineRef.current ? 1 : -1
        kickVyRef.current += dir * LINE_IMPULSE
        kickVrRef.current += (Math.random() - 0.5) * 0.06
        kickJitterRef.current += 0.4
      }
      prevLineRef.current = focusLine
      prevSylRef.current = activeLineSyllableCount
      if (cuesOn) {
        cueRef.current?.('feed')
        scheduleSettleForSoundOnly()
      }
    }

    if (layoutVersion !== prevLayoutRef.current && liveStatus === 'ready') {
      if (motionOn) {
        kickVyRef.current += LAYOUT_NUDGE * 0.4
        kickJitterRef.current += 0.25
      }
      prevLayoutRef.current = layoutVersion
      if (cuesOn) {
        cueRef.current?.('tick')
        scheduleSettleForSoundOnly()
      }
    }

    if (
      focusLine === prevLineRef.current &&
      activeLineSyllableCount !== prevSylRef.current &&
      liveStatus === 'ready'
    ) {
      if (motionOn) {
        kickVyRef.current += LAYOUT_NUDGE * 0.3
        kickJitterRef.current += 0.18
      }
      prevSylRef.current = activeLineSyllableCount
      if (cuesOn) {
        cueRef.current?.('tick')
        scheduleSettleForSoundOnly()
      }
    }

    if (liveStatus === 'ready' && prevStatusRef.current !== 'ready') {
      if (motionOn) {
        kickVyRef.current += LAYOUT_NUDGE * 0.25
        kickJitterRef.current += 0.12
      }
      if (cuesOn) {
        cueRef.current?.('tick')
        scheduleSettleForSoundOnly()
      }
    }
    prevStatusRef.current = liveStatus

    return () => {
      if (settleDebounceRef.current) {
        clearTimeout(settleDebounceRef.current)
        settleDebounceRef.current = null
      }
    }
  }, [
    enabled,
    cuesEnabled,
    reducedMotion,
    editorOpen,
    focusLine,
    layoutVersion,
    liveStatus,
    activeLineSyllableCount,
  ])

  useEffect(() => {
    if (!enabled || !editorOpen || reducedMotion) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      yRef.current = 0
      vyRef.current = 0
      rotRef.current = 0
      vrRef.current = 0
      jitterRef.current = 0
      kickVyRef.current = 0
      kickVrRef.current = 0
      kickJitterRef.current = 0
      motionSeenRef.current = false
      setTransform({ translateY: 0, rotateZ: 0, scale: 1 })
      return
    }

    const MAX_ROT = 0.45

    const hasPendingKick = () =>
      kickVyRef.current !== 0 || kickVrRef.current !== 0 || kickJitterRef.current !== 0

    const needsFrame = () =>
      !document.hidden &&
      (hasPendingKick() ||
        Math.abs(yRef.current) > 0.001 ||
        Math.abs(vyRef.current) > 0.001 ||
        Math.abs(rotRef.current) > 0.001 ||
        Math.abs(vrRef.current) > 0.001 ||
        jitterRef.current > 0.02)

    const step = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        rafRef.current = null
        return
      }

      if (hasPendingKick()) {
        vyRef.current += kickVyRef.current
        vrRef.current += kickVrRef.current
        jitterRef.current = Math.min(1.4, jitterRef.current + kickJitterRef.current)
        kickVyRef.current = 0
        kickVrRef.current = 0
        kickJitterRef.current = 0
      }

      const y = yRef.current
      const vy = vyRef.current
      const k = 0.22
      const damp = 0.88
      const newVy = vy * damp + (0 - y) * k
      const newY = y + newVy

      const rot = rotRef.current
      const vr = vrRef.current
      const newVr = vr * 0.9 + (0 - rot) * 0.2
      const newRot = rot + newVr

      jitterRef.current *= 0.91
      const j = jitterRef.current

      yRef.current = newY
      vyRef.current = newVy
      rotRef.current = newRot
      vrRef.current = newVr

      if (Math.abs(newY) > 0.35 || j > 0.08 || Math.abs(newRot) > 0.02) {
        motionSeenRef.current = true
      }

      const wobble = j * 0.35
      const scale = 1 - Math.min(0.012, Math.abs(newY) * 0.0012) + wobble * 0.003
      const rotClamped = Math.max(-MAX_ROT, Math.min(MAX_ROT, newRot + wobble * 0.025))

      setTransform({
        translateY: newY + Math.sin(performance.now() * 0.01) * wobble * 0.15,
        rotateZ: rotClamped,
        scale,
      })

      const settled =
        Math.abs(newY) < 0.04 &&
        Math.abs(newVy) < 0.04 &&
        Math.abs(newRot) < 0.01 &&
        Math.abs(newVr) < 0.02 &&
        jitterRef.current < 0.02

      if (settled) {
        if (motionSeenRef.current && cuesEnabledRef.current) {
          cueRef.current?.('settle')
        }
        motionSeenRef.current = false
        yRef.current = 0
        vyRef.current = 0
        rotRef.current = 0
        vrRef.current = 0
        jitterRef.current = 0
        setTransform({ translateY: 0, rotateZ: 0, scale: 1 })
        rafRef.current = null
        return
      }

      rafRef.current = requestAnimationFrame(step)
    }

    const trySchedule = () => {
      if (rafRef.current != null) return
      if (!needsFrame()) return
      rafRef.current = requestAnimationFrame(step)
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      } else {
        trySchedule()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    trySchedule()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [enabled, editorOpen, reducedMotion, focusLine, layoutVersion, liveStatus, activeLineSyllableCount])

  if (reducedMotion || !enabled || !editorOpen) {
    return { translateY: 0, rotateZ: 0, scale: 1 }
  }

  return transform
}
