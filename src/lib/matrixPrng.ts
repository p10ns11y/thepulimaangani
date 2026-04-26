/** Deterministic 0..1 for stable SSR/hydration. */
export function prng1(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}
