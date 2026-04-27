import { useEffect, useLayoutEffect, useRef } from 'react'

import type { LivePreviewState } from '#/types/livePreview'

import { SyllableLivePreview } from '../SyllableLivePreview'

type LiveSyllableWithSentinelProps = {
  poemText: string
  live: LivePreviewState
  variant?: 'default' | 'compact'
  pinEnd: boolean
  autoFollow?: boolean
  calmWhileEditing?: boolean
}

/** Live syllable row plus sentinel for optional auto-scroll to end while editing. */
export function LiveSyllableWithSentinel({
  poemText,
  live,
  variant = 'compact',
  pinEnd,
  autoFollow = false,
  calmWhileEditing = false,
}: LiveSyllableWithSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const canAutoScrollRef = useRef(true)
  const prevPinEndRef = useRef(false)

  useEffect(() => {
    if (pinEnd && !prevPinEndRef.current) {
      canAutoScrollRef.current = true
    }
    prevPinEndRef.current = pinEnd
  }, [pinEnd])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          canAutoScrollRef.current = e.isIntersecting
        }
      },
      { root: null, rootMargin: '0px', threshold: 0 },
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!pinEnd || !autoFollow) return
    // Never force-scroll the page while the editor dialog is active.
    if (document.querySelector('.prosody-poem-editor-dock-outer')) return
    if (!canAutoScrollRef.current) return
    const el = sentinelRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'end', behavior: reduced ? 'auto' : 'smooth' })
  }, [pinEnd, autoFollow, live.layoutVersion, poemText])

  return (
    <>
      <SyllableLivePreview poemText={poemText} live={live} variant={variant} disableLiveAnimations={calmWhileEditing} />
      <div ref={sentinelRef} className="pointer-events-none h-px w-full" aria-hidden />
    </>
  )
}
