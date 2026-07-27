/**
 * Learner-friendly print / offline HTML — plain browser APIs only
 * (Blob download + window.open + window.print). Labels match the app UI.
 */

import {
  getFootTypeDisplay,
  getLineClassDisplay,
  getLinkageSpecialDisplay,
  getLinkageTypeDisplay,
} from '#/components/prosody/displayLabels'
import { isNerSyllableType } from '#/lib/prosody/syllableType'
import type { ParsedPoem } from '#/types/parsedPoem'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** UI syllable label: நேர் / நிரை (same as Live chips). */
function syllableUiLabel(syllableType: string): string {
  return isNerSyllableType(syllableType) ? 'நேர்' : 'நிரை'
}

function bondUiLabel(edge: {
  linkage_type: string
  linkage_special_type: string
}): string {
  if (edge.linkage_special_type && edge.linkage_special_type !== 'Unknown') {
    return getLinkageSpecialDisplay(edge.linkage_special_type)
  }
  return getLinkageTypeDisplay(edge.linkage_type)
}

/** Build a self-contained printable HTML document — close to app chrome & labels. */
export function buildPrintableHtml(poemText: string, parsed: ParsedPoem | null): string {
  const metre = parsed?.metre_type ?? '—'
  const vikalpa = parsed != null ? String(parsed.vikalpa_count) : '—'
  const lineCount = parsed?.lines?.length ?? poemText.split(/\n/).filter(Boolean).length
  const syllableCount = Array.isArray(parsed?.syllables) ? parsed.syllables.length : '—'
  const bondCount = parsed?.linkage?.length ?? 0

  const presentationMetre = parsed?.presentation?.metre_type
  const metreDisplay =
    typeof presentationMetre === 'string' && presentationMetre.trim()
      ? presentationMetre
      : metre

  const linesHtml =
    parsed?.lines
      ?.map((line, i) => {
        const lineClass = getLineClassDisplay(line.line_class)
        const feet = line.feet
          .map((foot) => {
            const word = foot.syllables.map((s) => s.text).join('')
            const sylLabels = foot.syllables.map((s) => syllableUiLabel(s.syllable_type)).join(' · ')
            const footLabel =
              foot.display_foot_type_tamil ||
              foot.display_foot_type ||
              getFootTypeDisplay(foot.foot_type)
            return `<span class="foot-chip">
              <span class="foot-word">${escapeHtml(word)}</span>
              <span class="foot-syl">${escapeHtml(sylLabels)}</span>
              <span class="foot-type">${escapeHtml(footLabel)}</span>
            </span>`
          })
          .join('')
        return `<div class="line-block">
          <div class="line-label">Line ${i + 1} · ${escapeHtml(lineClass)}</div>
          <div class="feet-row">${feet}</div>
        </div>`
      })
      .join('\n') ?? `<pre class="poem">${escapeHtml(poemText)}</pre>`

  const bondsHtml =
    bondCount > 0 && parsed?.linkage
      ? `<ul class="bonds">${parsed.linkage
          .slice(0, 48)
          .map((e) => {
            const label = bondUiLabel(e)
            return `<li><span class="bond-idx">#${e.from_foot + 1} → ${e.to_foot + 1}</span>
              <span class="bond-name">${escapeHtml(label)}</span>${
                e.is_valid ? '' : ' <span class="bad">invalid</span>'
              }</li>`
          })
          .join('')}${
          bondCount > 48
            ? `<li class="muted">…and ${bondCount - 48} more</li>`
            : ''
        }</ul>`
      : '<p class="muted">No bonds in this parse.</p>'

  const title = 'யாப்பு · Prosody'
  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: 1.4cm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Noto Sans Tamil", "Noto Sans", "Manrope", system-ui, sans-serif;
      color: #2a2622;
      background: #f5f0e8;
      line-height: 1.55;
      max-width: 52rem;
      margin: 0 auto;
      padding: 1.25rem 1.35rem 2rem;
    }
    h1 {
      font-size: 1.15rem;
      font-weight: 650;
      margin: 0 0 0.15rem;
      letter-spacing: -0.01em;
    }
    h2 {
      font-size: 0.92rem;
      font-weight: 650;
      margin: 1.35rem 0 0.55rem;
      color: #2a2622;
    }
    .muted { color: #6e665c; font-size: 0.78rem; }
    .card {
      background: #faf6ef;
      border: 1px solid #e0d9ce;
      border-radius: 0.75rem;
      padding: 0.85rem 1rem;
      margin-top: 0.65rem;
      box-shadow: 0 1px 0 rgba(255,251,245,0.8) inset;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
      gap: 0.45rem;
      margin: 0.75rem 0 0.25rem;
    }
    .chip {
      border: 1px solid #e0d9ce;
      border-radius: 0.5rem;
      padding: 0.45rem 0.55rem;
      background: #faf6ef;
    }
    .chip .k {
      display: block;
      font-size: 0.62rem;
      color: #6e665c;
      font-weight: 650;
      letter-spacing: 0.03em;
      margin-bottom: 0.15rem;
    }
    .chip .v {
      font-size: 0.95rem;
      font-weight: 550;
    }
    pre.poem {
      font-family: inherit;
      white-space: pre-wrap;
      font-size: 1.05rem;
      margin: 0;
      line-height: 1.65;
    }
    .line-block { margin-bottom: 0.85rem; }
    .line-label {
      font-size: 0.72rem;
      color: #6e665c;
      margin-bottom: 0.35rem;
      font-weight: 550;
    }
    .feet-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .foot-chip {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
      border: 1px solid #d4cdc0;
      border-radius: 0.45rem;
      padding: 0.35rem 0.5rem;
      background: #fffdf8;
      min-width: 2.5rem;
    }
    .foot-word {
      font-size: 0.95rem;
      font-weight: 550;
    }
    .foot-syl {
      font-size: 0.62rem;
      color: #3d5c2e;
      font-weight: 600;
    }
    .foot-type {
      font-size: 0.58rem;
      color: #6e665c;
      max-width: 7rem;
      text-align: center;
      line-height: 1.25;
    }
    .bonds {
      list-style: none;
      margin: 0;
      padding: 0;
      font-size: 0.88rem;
    }
    .bonds li {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 0.75rem;
      padding: 0.35rem 0;
      border-bottom: 1px solid #ebe4da;
    }
    .bond-idx { color: #6e665c; font-variant-numeric: tabular-nums; font-size: 0.78rem; min-width: 4.5rem; }
    .bond-name { font-weight: 500; }
    .bad { color: #b54a40; font-size: 0.75rem; }
    @media print {
      body { background: #fff; padding: 0; max-width: none; }
      .card { box-shadow: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="muted">${escapeHtml(new Date().toLocaleString())}</p>
  <div class="summary">
    <div class="chip"><span class="k">Metre · பா</span><span class="v">${escapeHtml(String(metreDisplay))}</span></div>
    <div class="chip"><span class="k">Vikalpa</span><span class="v">${escapeHtml(vikalpa)}</span></div>
    <div class="chip"><span class="k">Lines · அடி</span><span class="v">${escapeHtml(String(lineCount))}</span></div>
    <div class="chip"><span class="k">Syllables · அசை</span><span class="v">${escapeHtml(String(syllableCount))}</span></div>
    <div class="chip"><span class="k">Bonds · தளை</span><span class="v">${escapeHtml(String(bondCount))}</span></div>
  </div>
  <h2>Poem · பா</h2>
  <div class="card"><pre class="poem">${escapeHtml(poemText)}</pre></div>
  <h2>Lines · அடி</h2>
  <div class="card">${linesHtml}</div>
  <h2>Bonds · தளை</h2>
  <div class="card">${bondsHtml}</div>
</body>
</html>`
}

/** Open a new tab/window and invoke the system print dialog (Save as PDF works here). */
export function openPrintableView(html: string): boolean {
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  window.setTimeout(() => {
    try {
      w.print()
    } catch {
      /* user can print manually */
    }
  }, 250)
  return true
}

/** Download the same HTML so learners can open/print offline. */
export function downloadHtmlFile(html: string, filename = 'tamil-prosody-print.html'): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}
