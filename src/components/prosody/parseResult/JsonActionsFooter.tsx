import { Button } from '#/components/ui/button'
import {
  buildPrintableHtml,
  downloadHtmlFile,
  openPrintableView,
} from '#/lib/prosody/printView'
import { cn } from '#/lib/utils'
import type { ParsedPoem } from '#/types/parsedPoem'

type JsonActionsFooterProps = {
  jsonString: string
  poemText: string
  parsed: ParsedPoem | null
}

/**
 * Learner-first download row (right-aligned). Blob + window.open + window.print only.
 */
export function JsonActionsFooter({ jsonString, poemText, parsed }: JsonActionsFooterProps) {
  const printable = () => buildPrintableHtml(poemText, parsed)

  return (
    <div
      className={cn(
        'border-rim/55 flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3',
        'bg-surface-2/88 supports-[backdrop-filter]:backdrop-blur-[3px]',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-8 text-xs"
        onClick={() => void navigator.clipboard.writeText(jsonString)}
        title="Full analysis JSON for tools"
      >
        Copy JSON
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted-foreground h-8 text-xs"
        onClick={() => {
          const blob = new Blob([jsonString], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'tamil-prosody-analysis.json'
          a.click()
          URL.revokeObjectURL(url)
        }}
        title="Full analysis JSON for tools"
      >
        JSON file
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => downloadHtmlFile(printable())}
      >
        Download HTML
      </Button>
      <Button
        type="button"
        variant="default"
        size="sm"
        className="h-8 text-xs font-medium"
        onClick={() => {
          const ok = openPrintableView(printable())
          if (!ok) downloadHtmlFile(printable())
        }}
      >
        Print / PDF
      </Button>
    </div>
  )
}
