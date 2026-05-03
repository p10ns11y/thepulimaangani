import type { ParsedPoem } from '#/types/parsedPoem'

import { formatTotalLetters } from '#/lib/textualInsightsCounts'

type TextualInsightsProps = {
  data: ParsedPoem
}

export function TextualInsights({ data }: TextualInsightsProps) {
  const footTotal = data.lines.reduce((sum, line) => sum + line.feet.length, 0)
  const totalLetters = formatTotalLetters(data)
  const letterDetail =
    typeof data.letter_count === 'object' && data.letter_count !== null
      ? JSON.stringify(data.letter_count)
      : null

  return (
    <div className="luxe-inset-surface rounded-lg p-3 shadow-none sm:p-4">
      <h3 className="text-foreground mb-3 text-sm font-medium">Textual insights</h3>
      <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
        <div className="bg-surface-2/90 border-rim/35 rounded-md border px-2.5 py-2">
          <span className="text-muted-foreground text-xs">Lines</span>
          <span className="text-foreground ml-1.5 font-medium">{data.lines.length}</span>
        </div>
        <div className="bg-surface-2/90 border-rim/35 rounded-md border px-2.5 py-2">
          <span className="text-muted-foreground text-xs">Feet</span>
          <span className="text-foreground ml-1.5 font-medium">{footTotal}</span>
        </div>
        <div className="bg-surface-2/90 border-rim/35 rounded-md border px-2.5 py-2">
          <span className="text-muted-foreground text-xs">Syllables</span>
          <span className="text-foreground ml-1.5 font-medium">{data.syllables.length}</span>
        </div>
        <div className="bg-surface-2/90 border-rim/35 rounded-md border px-2.5 py-2">
          <span className="text-muted-foreground text-xs">Total letters</span>
          <span className="text-foreground ml-1.5 font-medium tabular-nums">{totalLetters}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="bg-surface-2/90 border-rim/35 rounded-md border px-2.5 py-2">
          <span className="text-muted-foreground text-xs">Metre type</span>
          <p className="text-foreground mt-0.5 text-sm font-medium">{data.metre_type}</p>
        </div>
        <div className="bg-surface-2/90 border-rim/35 rounded-md border px-2.5 py-2">
          <span className="text-muted-foreground text-xs">Vikalpa</span>
          <p className="text-foreground mt-0.5 text-sm font-medium">{String(data.vikalpa_count)}</p>
        </div>
      </div>
      {letterDetail ? (
        <div className="border-rim/30 bg-surface-2/50 mt-3 rounded-md border px-2.5 py-2">
          <span className="text-muted-foreground text-xs">Letter breakdown (parser)</span>
          <pre className="text-foreground mt-1 mb-0 overflow-x-auto font-mono text-xs leading-snug whitespace-pre-wrap">
            {letterDetail}
          </pre>
        </div>
      ) : null}
    </div>
  )
}
