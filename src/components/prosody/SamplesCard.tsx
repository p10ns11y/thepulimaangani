import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
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
import { getMetreBlock, METRE_ORDER, METRE_TAB_LABEL, type MetreKey } from '#/machines/prosodyLab.defaults'

const cardClass = 'luxe-prosody-card luxe-sheen-hover bg-transparent overflow-hidden rounded-xl'

type SamplesCardProps = {
  metreKey: MetreKey
  selectedEn: string
  onMetreChange: (key: MetreKey) => void
  onSampleSelect: (en: string) => void
}

export function SamplesCard({ metreKey, selectedEn, onMetreChange, onSampleSelect }: SamplesCardProps) {
  return (
    <Card className={cardClass}>
      <CardHeader className="px-4 py-3 pb-2">
        <CardTitle className="text-balance text-base font-semibold tracking-tight">Samples</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-0">
        <Tabs
          value={metreKey}
          onValueChange={(v) => {
            if (!METRE_ORDER.includes(v as MetreKey)) return
            onMetreChange(v as MetreKey)
          }}
        >
          <TabsList className="prosody-metre-grid bg-surface-3/75 border-rim/40 grid w-full min-w-0 grid-cols-2 gap-1 border p-1 md:grid-cols-4">
            {METRE_ORDER.map((k) => (
              <TabsTrigger
                key={k}
                value={k}
                className="font-tamil luxe-gem-focus !h-auto min-h-[2.65rem] w-full min-w-0 !whitespace-normal px-1.5 py-2 text-center text-[0.62rem] leading-[1.2] [text-wrap:balance] data-active:border-rim/55 data-active:bg-surface-1/95 data-active:shadow-sm md:min-h-[2.4rem] md:px-2 md:text-[0.7rem] md:leading-snug"
              >
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
            <Select value={selectedEn} onValueChange={onSampleSelect}>
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
  )
}
