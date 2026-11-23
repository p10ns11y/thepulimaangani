// Mermaid lays a subgraph out with its parent direction when an இல்லை edge
// crosses the tier boundary, so a single flowchart TB render becomes one
// column. Each tier is rendered left to right, then stacked. The 1-combined
// tier is two rows so the picture stays near 4:3 at a size GitHub can show.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const overviewPath = resolve(repoRoot, 'docs/classical-tree.mmd')
const stylePath = resolve(repoRoot, 'docs/mermaid-tamil.css')
const mermaidConfigPath = resolve(repoRoot, 'docs/mermaid-config.json')
const puppeteerConfigPath = resolve(repoRoot, 'docs/mermaid-puppeteer.json')
const svgPath = resolve(repoRoot, 'docs/classical-tree.svg')
const pngPath = resolve(repoRoot, 'docs/classical-tree.png')
const tierDirectory = resolve('/tmp/classical-tree-tiers')

const rowOrder = [
  'tier_eight_six',
  'tier_four',
  'tier_three',
  'tier_two',
  'tier_one_a',
  'tier_one_b',
]
const joinHeight = 46
const boardPad = 12

function tierSources(overviewSource) {
  const initLine = overviewSource.split('\n')[0]
  const body = overviewSource.split('\n').slice(1).join('\n')
  const tiers = new Map()
  const pattern = /subgraph (tier_\w+)\["([^"]*)"\]\n([\s\S]*?)\n {2}end/g
  for (const match of body.matchAll(pattern)) {
    const tierId = match[1]
    const inner = match[3]
      .split('\n')
      .filter((line) => !line.trim().startsWith('direction '))
      .map((line) => line.replace(/^ {4}/, '  '))
      .join('\n')
    tiers.set(tierId, `${initLine}\nflowchart LR\n${inner}\n`)
  }
  return tiers
}

function viewBoxOf(svg) {
  const match = svg.match(/viewBox="([^"]+)"/)
  if (!match) {
    throw new Error('tier svg has no viewBox')
  }
  const [minX, minY, width, height] = match[1].split(/\s+/).map(Number)
  return { minX, minY, width, height }
}

function nodeEdges(svg) {
  const nodes = []
  const pattern =
    /transform="translate\(([^,]+),\s*([^)]+)\)"><rect class="basic label-container"[^>]*x="([^"]+)"[^>]*width="([^"]+)"/g
  for (const match of svg.matchAll(pattern)) {
    const originX = Number(match[1])
    const left = originX + Number(match[3])
    const right = left + Number(match[4])
    nodes.push({ left, right })
  }
  if (nodes.length === 0) {
    throw new Error('tier svg has no nodes')
  }
  nodes.sort((leftNode, rightNode) => leftNode.left - rightNode.left)
  return { first: nodes[0], last: nodes[nodes.length - 1] }
}

function prefixSvg(svg, prefix) {
  return svg
    .replaceAll('my-svg', prefix)
    .replace(/\swidth="100%"/, '')
    .replace(/style="[^"]*"/, '')
}

function renderTiers(overviewSource) {
  mkdirSync(tierDirectory, { recursive: true })
  const tiers = tierSources(overviewSource)
  const rows = []
  for (const tierId of rowOrder) {
    const source = tiers.get(tierId)
    if (!source) {
      throw new Error(`missing subgraph ${tierId}`)
    }
    const inputPath = resolve(tierDirectory, `${tierId}.mmd`)
    const outputPath = resolve(tierDirectory, `${tierId}.svg`)
    writeFileSync(inputPath, source)
    execFileSync(
      'npx',
      [
        '-y',
        '@mermaid-js/mermaid-cli@12.2.0',
        '-i',
        inputPath,
        '-o',
        outputPath,
        '-c',
        mermaidConfigPath,
        '-p',
        puppeteerConfigPath,
        '-C',
        stylePath,
        '-b',
        'white',
      ],
      { stdio: 'inherit' },
    )
    const svg = readFileSync(outputPath, 'utf8')
    const box = viewBoxOf(svg)
    const edges = nodeEdges(svg)
    rows.push({
      tierId,
      svg: prefixSvg(svg, tierId.replaceAll('_', '-')),
      box,
      edges,
    })
  }
  return rows
}

function compose(rows) {
  const width = Math.max(...rows.map((row) => row.box.width)) + boardPad * 2
  let cursorY = boardPad
  const placed = []
  for (const row of rows) {
    placed.push({ ...row, y: cursorY })
    cursorY += row.box.height + joinHeight
  }
  cursorY -= joinHeight
  const height = cursorY + boardPad
  const joins = []
  for (let index = 0; index < placed.length - 1; index += 1) {
    const fromRow = placed[index]
    const toRow = placed[index + 1]
    const fromX = boardPad + (fromRow.edges.last.right - fromRow.box.minX)
    const toX = boardPad + (toRow.edges.first.left - toRow.box.minX)
    const top = fromRow.y + fromRow.box.height
    joins.push({ fromX, toX, top })
  }
  return { width, height, placed, joins }
}

function boardSvg({ width, height, placed, joins }) {
  const rowMarkup = placed
    .map((row) => {
      const inner = row.svg.replace(/^<svg\b/, `<svg x="${boardPad}" y="${row.y}" width="${row.box.width}" height="${row.box.height}"`)
      return inner
    })
    .join('\n')
  const joinMarkup = joins
    .map((join) => {
      const midY = join.top + joinHeight / 2
      const labelX = (join.fromX + join.toX) / 2
      return `<path d="M ${join.fromX} ${join.top + 2} V ${midY} H ${join.toX} V ${join.top + joinHeight - 2}" fill="none" stroke="#666" stroke-width="1.4" marker-end="url(#snake-arrow)"/>
<rect x="${labelX - 28}" y="${midY - 18}" width="56" height="16" fill="white"/>
<text x="${labelX}" y="${midY - 6}" text-anchor="middle" font-family="Noto Sans Tamil, Noto Serif Tamil, sans-serif" font-size="13" fill="#333">இல்லை</text>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="white"/>
<defs><marker id="snake-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#666"/></marker></defs>
${rowMarkup}
${joinMarkup}
</svg>
`
}

function boardHtml(svg) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="${stylePath}"/>
<style>
  html, body { margin: 0; background: white; }
  svg { display: block; }
</style>
</head>
<body>
${svg}
</body>
</html>
`
}

const overviewSource = readFileSync(overviewPath, 'utf8')
const rows = renderTiers(overviewSource)
const layout = compose(rows)
const svg = boardSvg(layout)
writeFileSync(svgPath, svg)
const htmlPath = resolve(tierDirectory, 'overview.html')
writeFileSync(htmlPath, boardHtml(svg))

const chromePath = '/usr/bin/google-chrome-stable'
execFileSync(
  chromePath,
  [
    '--headless=new',
    '--no-sandbox',
    '--allow-file-access-from-files',
    '--font-render-hinting=none',
    '--hide-scrollbars',
    '--default-background-color=FFFFFFFF',
    `--window-size=${Math.ceil(layout.width)},${Math.ceil(layout.height)}`,
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ],
  { stdio: 'inherit' },
)

console.log(`wrote ${svgPath} and ${pngPath} at ${Math.round(layout.width)}x${Math.round(layout.height)}`)
