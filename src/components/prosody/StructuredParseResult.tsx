import type { ParsedPoem } from '#/types/parsedPoem'

import { StructureAccordion } from './StructureAccordion'

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

      <div className="luxe-inset-surface rounded-lg p-3 shadow-none">
        <h3 className="text-foreground mb-3 text-sm font-medium">Prosodic structure</h3>
        <StructureAccordion data={data} />
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
