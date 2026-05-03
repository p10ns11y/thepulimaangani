import type { ParsedPoem } from '#/types/parsedPoem'

import { StructureAccordion } from './StructureAccordion'

type StructuredParseResultProps = {
  data: ParsedPoem
}

export function StructuredParseResult({ data }: StructuredParseResultProps) {
  return (
    <div className="flex flex-col gap-4">
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
