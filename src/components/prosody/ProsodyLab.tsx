import { useEffect, useMemo, useState } from 'react'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Separator } from '#/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { poemVariations } from '#/data/poemVariations'
import { useDebouncedParsedPoem } from '#/hooks/useDebouncedParsedPoem'
import { useWasmParser } from '#/hooks/useWasmParser'

import { ParseResultPanel } from './ParseResultPanel'

type VariationRow = { en: string; ta: string; example: string }

type MetreBlock = {
  special_types: VariationRow[]
  variations: VariationRow[]
}

const METRE_ORDER = ['venpaa', 'aciriyappa', 'kalippaa', 'vanjippaa'] as const
type MetreKey = (typeof METRE_ORDER)[number]

const METRE_TAB_LABEL: Record<MetreKey, string> = {
  venpaa: 'வெண்பா',
  aciriyappa: 'ஆசிரியப்பா',
  kalippaa: 'கலிப்பா',
  vanjippaa: 'வஞ்சிப்பா',
}

function getMetreBlock(key: MetreKey): MetreBlock {
  const all = poemVariations as Record<string, MetreBlock>
  return all[key]
}

const venFirst = getMetreBlock('venpaa')
const defaultRow =
  venFirst.special_types.find((r) => r.en === 'kalivenpaa') ?? venFirst.special_types[0]!

const cardClass = 'border bg-card shadow-sm overflow-hidden rounded-xl'

export function ProsodyLab() {
  const [metreKey, setMetreKey] = useState<MetreKey>('venpaa')
  const [selectedEn, setSelectedEn] = useState(defaultRow.en)
  const [poemText, setPoemText] = useState(defaultRow.example)
  const { parse, result, loading, validationError } = useWasmParser()
  const livePreview = useDebouncedParsedPoem(poemText)

  const flatRows = useMemo(() => {
    const b = getMetreBlock(metreKey)
    return [...b.special_types, ...b.variations]
  }, [metreKey])

  useEffect(() => {
    const ens = new Set(flatRows.map((r) => r.en))
    if (!ens.has(selectedEn)) {
      const first = flatRows[0]
      if (first) {
        setSelectedEn(first.en)
        setPoemText(first.example)
      }
    }
  }, [metreKey, flatRows, selectedEn])

  const handleMetreTab = (value: string) => {
    if (!METRE_ORDER.includes(value as MetreKey)) return
    setMetreKey(value as MetreKey)
  }

  const handleSampleChange = (en: string) => {
    setSelectedEn(en)
    const hit = flatRows.find((r) => r.en === en)
    if (hit) setPoemText(hit.example)
  }

  return (
    <main className="page-wrap px-3 pb-8 pt-4 sm:px-4 sm:pt-5">
      <div className="mx-auto grid max-w-[min(1200px,100%)] gap-5 lg:grid-cols-[minmax(0,38.2fr)_minmax(0,61.8fr)] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className={cardClass}>
            <CardHeader className="px-4 py-3 pb-2">
              <CardTitle className="text-balance text-base font-semibold tracking-tight">
                Poem &amp; parse
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-0">
              <Textarea
                value={poemText}
                onChange={(e) => setPoemText(e.target.value)}
                placeholder="Enter Tamil poem here…"
                className="font-tamil min-h-[6.5rem] resize-y rounded-lg text-[0.95rem] leading-relaxed sm:min-h-[7rem]"
                spellCheck={false}
              />
              {validationError ? (
                <div className="border-destructive/35 bg-destructive/8 rounded-lg border px-3 py-2">
                  <p className="text-destructive m-0 text-sm">{validationError}</p>
                </div>
              ) : null}
              <Separator />
              <Button
                type="button"
                onClick={() => void parse(poemText)}
                disabled={loading}
                className="h-9 w-fit min-w-[7.5rem] rounded-md px-4 text-sm font-medium"
              >
                {loading ? 'Parsing…' : 'Parse poem'}
              </Button>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="px-4 py-3 pb-2">
              <CardTitle className="text-balance text-base font-semibold tracking-tight">Samples</CardTitle>
              <CardDescription className="text-muted-foreground text-xs leading-snug sm:text-sm">
                Metre, then variation — replaces the poem text above.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-0">
              <Tabs value={metreKey} onValueChange={handleMetreTab}>
                <TabsList className="bg-muted/50 h-auto w-full flex-wrap justify-start gap-0.5 p-1 sm:w-fit">
                  {METRE_ORDER.map((k) => (
                    <TabsTrigger key={k} value={k} className="font-tamil px-2.5 py-1.5 text-xs sm:text-sm">
                      {METRE_TAB_LABEL[k]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value={metreKey} className="mt-3 outline-none">
                  <label
                    className="text-foreground/80 mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-wider"
                    htmlFor="sample-select"
                  >
                    Variation
                  </label>
                  <Select value={selectedEn} onValueChange={handleSampleChange}>
                    <SelectTrigger id="sample-select" className="font-tamil h-9 w-full text-sm">
                      <SelectValue placeholder="Pick a sample" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>சிறப்பு வகை</SelectLabel>
                        {getMetreBlock(metreKey).special_types.map((row) => (
                          <SelectItem key={row.en} value={row.en} className="font-tamil">
                            {row.ta}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>மாற்று வகை</SelectLabel>
                        {getMetreBlock(metreKey).variations.map((row) => (
                          <SelectItem key={row.en} value={row.en} className="font-tamil">
                            {row.ta}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 lg:self-start">
          <ParseResultPanel result={result} poemText={poemText} live={livePreview} />
        </div>
      </div>
    </main>
  )
}
