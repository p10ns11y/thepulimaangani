import tamil from '#/data/tamilIlaganamLetters.json'

export type TamilIlaganamData = {
  vowels: string[]
  pure_consonants: string[]
  uyirmei_matrix: string[][]
  aytham: string
  total_characters: number
}

export const tamilIlaganam: TamilIlaganamData = tamil

/** 12 lines × 18 letters for Pretext (atomic lines, no extra whitespace). */
export function uyirmeiPretextSource(): string {
  return tamil.uyirmei_matrix.map((row) => row.join('')).join('\n')
}

export function aythamChar(): string {
  return tamil.aytham
}

/** 216 characters in row-major order (12 × 18 uyirmei). */
export function uyirmeiMatrixFlat(): string[] {
  return tamil.uyirmei_matrix.flat()
}
