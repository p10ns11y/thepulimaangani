const PHYSICS_KEY = 'thepulimaangani.typewriter.paperPhysics'
const SOUND_KEY = 'thepulimaangani.typewriter.sound'

export function readPaperPhysicsEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const v = window.localStorage.getItem(PHYSICS_KEY)
  if (v === null) return true
  return v === '1' || v === 'true'
}

export function writePaperPhysicsEnabled(on: boolean): void {
  window.localStorage.setItem(PHYSICS_KEY, on ? '1' : '0')
}

export function readTypewriterSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const v = window.localStorage.getItem(SOUND_KEY)
  if (v === null) return false
  return v === '1' || v === 'true'
}

export function writeTypewriterSoundEnabled(on: boolean): void {
  window.localStorage.setItem(SOUND_KEY, on ? '1' : '0')
}
