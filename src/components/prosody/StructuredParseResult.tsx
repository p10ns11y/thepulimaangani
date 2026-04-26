import type { ParsedPoem } from '#/types/parsedPoem'

import { getFootTypeDisplay, getLineClassDisplay } from './displayLabels'
import { SyllableChip } from './SyllableChip'

type StructuredParseResultProps = {
  data: ParsedPoem
}

export function StructuredParseResult({ data }: StructuredParseResultProps) {
  const footTotal = data.lines.reduce((sum, line) => sum + line.feet.length, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="luxe-inset-surface rounded-lg p-3 shadow-none">
        <h3 className="text-foreground mb-2 text-sm font-medium">Analysis summary</h3>
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="luxe-inset-surface rounded-lg p-3 shadow-none">
          <h4 className="text-muted-foreground mb-0.5 text-xs font-medium">Metre type</h4>
          <p className="text-foreground text-sm font-medium">{data.metre_type}</p>
        </div>
        <div className="luxe-inset-surface rounded-lg p-3 shadow-none">
          <h4 className="text-muted-foreground mb-0.5 text-xs font-medium">Letter count</h4>
          <p className="text-foreground text-sm font-medium">
            {typeof data.letter_count === 'object'
              ? JSON.stringify(data.letter_count)
              : String(data.letter_count)}
          </p>
        </div>
        <div className="luxe-inset-surface rounded-lg p-3 shadow-none">
          <h4 className="text-muted-foreground mb-0.5 text-xs font-medium">Vikalpa</h4>
          <p className="text-foreground text-sm font-medium">{String(data.vikalpa_count)}</p>
        </div>
      </div>

      <div>
        <h3 className="text-foreground mb-2 text-sm font-medium">Prosodic structure</h3>
        <div className="flex flex-col gap-3">
          {data.lines.map((line, i) => (
            <div
              key={`line-${i}-${line.line_class}`}
              className="luxe-inset-surface rounded-lg p-3 shadow-none"
            >
              <h4 className="text-foreground mb-2 text-sm font-medium">
                Line {i + 1}{' '}
                <span className="text-muted-foreground font-normal">
                  ({getLineClassDisplay(line.line_class)})
                </span>
              </h4>
              <div className="flex flex-col gap-2">
                {line.feet.map((foot, j) => (
                  <div
                    key={`foot-${i}-${j}-${foot.foot_type}`}
                    className="bg-surface-2/80 border-rim/40 ml-0 rounded-md border p-2.5 md:ml-3"
                  >
                    <div className="text-foreground mb-1.5 text-xs font-medium sm:text-sm">
                      Foot {j + 1}{' '}
                      <span className="text-muted-foreground text-sm">
                        ({getFootTypeDisplay(foot.foot_type)})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {foot.syllables.map((syl, k) => (
                        <SyllableChip
                          key={`syl-${i}-${j}-${k}-${syl.text}`}
                          syllableType={syl.syllable_type}
                          text={syl.text}
                          variant="comfortable"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.errors && data.errors.length > 0 ? (
        <div className="border-destructive/40 bg-destructive/10 rounded-lg border p-4">
          <h4 className="text-destructive mb-2 font-medium">Errors</h4>
          <ul className="text-destructive">
            {data.errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
