import { useEffect, useRef } from 'react'

import { aythamChar } from '#/lib/tamilIlaganam'
import { cn } from '#/lib/utils'

/** Default companion in the header chase (elusive “never quite touch”). */
const HEADER_CHASE_EMOJI = '🦋'

const PLAY = { w: 132, h: 44, pad: 6 } as const
const D_MIN = 30

type Body = { x: number; y: number; vx: number; vy: number }

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function hypotDist(a: Body, b: Body): number {
  return Math.hypot(b.x - a.x, b.y - a.y) || 0.0001
}

type AythamEmojiChaseProps = {
  className?: string
  /** When true, no rAF — static aytham left, emoji right. */
  reducedMotion: boolean
}

/**
 * aytham pursues a companion emoji; separation is enforced so they never quite touch.
 */
export function AythamEmojiChase({ className, reducedMotion }: AythamEmojiChaseProps) {
  const aythamRef = useRef<HTMLSpanElement>(null)
  const emojiRef = useRef<HTMLSpanElement>(null)
  const a = useRef<Body>({ x: 14, y: 20, vx: 0, vy: 0 })
  const b = useRef<Body>({ x: PLAY.w - 30, y: 22, vx: 0, vy: 0 })

  useEffect(() => {
    if (reducedMotion) return

    const elA = aythamRef.current
    const elB = emojiRef.current
    if (!elA || !elB) return

    let id = 0
    const tick = () => {
      const pA = a.current
      const pB = b.current
      const d = hypotDist(pA, pB)
      const dx = pB.x - pA.x
      const dy = pB.y - pA.y
      const ux = dx / d
      const uy = dy / d

      pA.vx += ux * 0.42
      pA.vy += uy * 0.42
      pA.vx *= 0.88
      pA.vy *= 0.88
      pA.x += pA.vx
      pA.y += pA.vy

      if (d < 52) {
        pB.vx -= ux * 0.62
        pB.vy -= uy * 0.62
      }
      pB.vx += (Math.random() - 0.5) * 0.1
      pB.vy += (Math.random() - 0.5) * 0.1
      pB.vx *= 0.9
      pB.vy *= 0.9
      pB.x += pB.vx
      pB.y += pB.vy

      pA.x = clamp(pA.x, PLAY.pad, PLAY.w - 22)
      pA.y = clamp(pA.y, PLAY.pad, PLAY.h - 18)
      pB.x = clamp(pB.x, PLAY.pad, PLAY.w - 24)
      pB.y = clamp(pB.y, PLAY.pad, PLAY.h - 24)

      const d2 = hypotDist(pA, pB)
      if (d2 < D_MIN) {
        const uux = (pB.x - pA.x) / d2
        const uuy = (pB.y - pA.y) / d2
        const push = (D_MIN - d2) * 0.5
        pA.x -= uux * push
        pA.y -= uuy * push
        pB.x += uux * push
        pB.y += uuy * push
        pA.x = clamp(pA.x, PLAY.pad, PLAY.w - 22)
        pA.y = clamp(pA.y, PLAY.pad, PLAY.h - 18)
        pB.x = clamp(pB.x, PLAY.pad, PLAY.w - 24)
        pB.y = clamp(pB.y, PLAY.pad, PLAY.h - 24)
      }

      elA.style.transform = `translate3d(${pA.x}px,${pA.y}px,0)`
      elB.style.transform = `translate3d(${pB.x}px,${pB.y}px,0)`
      id = requestAnimationFrame(tick)
    }
    elA.style.transform = `translate3d(${a.current.x}px,${a.current.y}px,0)`
    elB.style.transform = `translate3d(${b.current.x}px,${b.current.y}px,0)`
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [reducedMotion])

  const aytham = aythamChar()
  if (reducedMotion) {
    return (
      <div
        className={cn('relative', className)}
        style={{ width: PLAY.w, height: PLAY.h }}
        aria-hidden
      >
        <span
          className="text-[var(--lagoon)] font-tamil absolute top-1/2 left-3 -translate-y-1/2 text-base leading-none select-none"
          style={{ textShadow: '0 0 12px color-mix(in oklab, var(--gem-ruby) 30%, transparent)' }}
        >
          {aytham}
        </span>
        <span
          className="absolute top-1/2 right-3 -translate-y-1/2 text-lg leading-none select-none"
          role="img"
          aria-label=""
        >
          {HEADER_CHASE_EMOJI}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn('relative touch-none', className)}
      style={{ width: PLAY.w, height: PLAY.h }}
      aria-hidden
    >
      <span
        ref={aythamRef}
        className="text-[var(--lagoon)] font-tamil absolute left-0 top-0 text-base leading-none will-change-transform select-none"
        style={{ textShadow: '0 0 14px color-mix(in oklab, var(--gem-diamond) 18%, transparent)' }}
      >
        {aytham}
      </span>
      <span
        ref={emojiRef}
        className="absolute top-0 left-0 text-lg leading-none will-change-transform select-none"
        style={{ fontFamily: 'inherit' }}
      >
        {HEADER_CHASE_EMOJI}
      </span>
    </div>
  )
}
