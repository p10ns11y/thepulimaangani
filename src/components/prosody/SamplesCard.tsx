import { ChevronDown, PanelLeftClose } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { cn } from '#/lib/utils'
import {
  getFlatRows,
  getMetreBlock,
  METRE_ORDER,
  METRE_TAB_LABEL,
  type MetreKey,
} from '#/machines/prosodyLab.defaults'

const cardClass = 'luxe-prosody-card luxe-sheen-hover bg-transparent overflow-hidden rounded-xl'

type SamplesCardProps = {
  metreKey: MetreKey
  selectedEn: string
  onMetreChange: (key: MetreKey) => void
  onSampleSelect: (en: string) => void
  /** Collapse the whole Learn column so Structure can use full width. */
  onCollapseRail?: () => void
  /** Initial open state (default true so metre tabs are available for learning / tests). */
  defaultExpanded?: boolean
}

/**
 * Metre + variation selector. Top chrome owns Learn + More space so the left
 * column’s first card aligns with the results card top edge.
 */
export function SamplesCard({
  metreKey,
  selectedEn,
  onMetreChange,
  onSampleSelect,
  onCollapseRail,
  defaultExpanded = true,
}: SamplesCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const variationTa = useMemo(() => {
    const rows = getFlatRows(metreKey)
    return rows.find((r) => r.en === selectedEn)?.ta ?? selectedEn
  }, [metreKey, selectedEn])

  const summaryLine = `${METRE_TAB_LABEL[metreKey]} · ${variationTa}`
  const showPicker = expanded

  return (
    <Card className={cardClass} data-testid="samples-card">
      <CardHeader className="space-y-2 px-3 pb-2 pt-3 sm:px-4 sm:pt-3.5">
        {/* Aligns with right panel top chrome (tabs row) */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-foreground m-0 text-sm font-semibold tracking-tight sm:text-[0.95rem]">
            Learn
          </p>
          {onCollapseRail ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 shrink-0 gap-1.5 px-2 text-xs font-medium"
              aria-expanded={true}
              data-testid="prosody-input-rail-collapse"
              onClick={onCollapseRail}
            >
              <PanelLeftClose className="size-3.5" aria-hidden />
              More space
            </Button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={showPicker}
          aria-controls="samples-picker-body"
          data-testid="samples-selector-toggle"
          className="hover:bg-surface-2/50 -mx-0.5 flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors"
        >
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 shrink-0 transition-transform',
              showPicker ? 'rotate-180' : '',
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="text-foreground block font-tamil text-[0.85rem] font-medium leading-snug">
              {summaryLine}
            </span>
            <span className="text-muted-foreground mt-0.5 block text-[0.65rem]">
              {showPicker ? 'Hide samples' : 'Show samples'}
            </span>
          </span>
        </button>
      </CardHeader>
      {showPicker ? (
        <CardContent
          id="samples-picker-body"
          className="flex flex-col gap-3 px-3 pb-4 pt-0 sm:px-4"
          data-testid="samples-picker-body"
        >
          <Tabs
            value={metreKey}
            onValueChange={(v) => {
              if (!METRE_ORDER.includes(v as MetreKey)) return
              onMetreChange(v as MetreKey)
            }}
          >
            <TabsList className="prosody-metre-grid bg-surface-3/75 border-rim/40 grid h-auto w-full min-w-0 grid-cols-2 gap-1 border p-1 md:grid-cols-4">
              {METRE_ORDER.map((k) => (
                <TabsTrigger
                  key={k}
                  value={k}
                  title={METRE_TAB_LABEL[k]}
                  className="font-tamil luxe-gem-focus h-8 w-full min-w-0 shrink-0 truncate px-1.5 py-0 text-center text-[0.68rem] leading-none whitespace-nowrap data-active:border-rim/55 data-active:bg-surface-1/95 data-active:shadow-sm md:px-2 md:text-[0.75rem]"
                >
                  {METRE_TAB_LABEL[k]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={metreKey} className="mt-3 outline-none">
              <label
                className="text-muted-foreground mb-1.5 block text-[0.65rem] font-semibold tracking-wider uppercase"
                htmlFor="sample-select"
              >
                Variation
              </label>
              <Select
                value={selectedEn}
                onValueChange={(en) => {
                  onSampleSelect(en)
                }}
              >
                <SelectTrigger
                  id="sample-select"
                  className="font-tamil border-rim/50 bg-surface-2/60 h-9 w-full text-[0.8125rem] shadow-none"
                >
                  <SelectValue placeholder="Pick a sample" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>சிறப்பு வகை</SelectLabel>
                    {getMetreBlock(metreKey).special_types.map((row) => (
                      <SelectItem key={`st:${row.en}`} value={row.en} className="font-tamil">
                        {row.ta}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>மாற்று வகை</SelectLabel>
                    {getMetreBlock(metreKey).variations.map((row) => (
                      <SelectItem key={`var:${row.en}`} value={row.en} className="font-tamil">
                        {row.ta}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
        </CardContent>
      ) : null}
    </Card>
  )
}
