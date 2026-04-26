import type { ParsedPoem } from '#/types/parsedPoem'

/** Summary lines for the Text flow tab (no poem body — editor + live preview already show it). */
export function buildParseFlowText(data: ParsedPoem): string {
  const footCount = data.lines.reduce((sum, line) => sum + line.feet.length, 0)
  return [
    `மீட்டர்: ${data.metre_type}`,
    `வரிகள்: ${data.lines.length} | அடிகள்: ${footCount} | சீர்கள்: ${data.syllables.length}`,
    `விகற்பம்: ${String(data.vikalpa_count)}`,
    `எழுத்தெண்: ${typeof data.letter_count === 'object' ? JSON.stringify(data.letter_count) : String(data.letter_count)}`,
  ].join('\n')
}
