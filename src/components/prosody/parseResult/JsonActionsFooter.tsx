import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type JsonActionsFooterProps = {
  jsonString: string
}

export function JsonActionsFooter({ jsonString }: JsonActionsFooterProps) {
  return (
    <div
      className={cn(
        'border-rim/55 flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3',
        'bg-surface-2/88 supports-[backdrop-filter]:backdrop-blur-[3px]',
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs transition-[transform,box-shadow] duration-200 hover:shadow-sm active:scale-[0.98]"
        onClick={() => void navigator.clipboard.writeText(jsonString)}
      >
        Copy JSON
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs transition-[transform,box-shadow] duration-200 hover:shadow-sm active:scale-[0.98]"
        onClick={() => {
          const blob = new Blob([jsonString], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'tamil-prosody-analysis.json'
          a.click()
          URL.revokeObjectURL(url)
        }}
      >
        Export JSON
      </Button>
    </div>
  )
}
