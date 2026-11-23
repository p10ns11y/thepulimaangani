import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const overviewPath = resolve(repoRoot, 'docs/classical-tree.mmd')
const markdownPath = resolve(repoRoot, 'docs/classical-tree.md')
const treeSourcePath = resolve(repoRoot, 'tamil-seiyul-alagi/src/classical_tree.rs')

const fallThroughLabel = 'இல்லை'
const terminalNode = 'none'

function familyOrderFromTreeSource(treeSource) {
  const familyFunction = treeSource.split('fn family_id')[1]?.split('fn discriminator_count')[0]
  if (!familyFunction) {
    throw new Error('family_id is missing from classical_tree.rs')
  }
  const familyByGate = new Map()
  for (const arm of familyFunction.matchAll(/((?:"[^"]+"\s*\|\s*)*"[^"]+")\s*=>\s*"([^"]+)"/g)) {
    const familyName = arm[2]
    for (const gateId of arm[1].matchAll(/"([^"]+)"/g)) {
      familyByGate.set(gateId[1], familyName)
    }
  }
  const gateRows = [...treeSource.matchAll(/id: "([^"]+)",\s*avalokitam_rank: (\d+),\s*condition_count: (\d+)/g)]
  if (gateRows.length === 0) {
    throw new Error('no GateSpec rows in classical_tree.rs')
  }
  const sortedGates = gateRows.map((row) => {
    const gateId = row[1]
    const familyName = familyByGate.get(gateId)
    if (!familyName) {
      throw new Error(`gate ${gateId} has no family_id arm`)
    }
    return {
      gateId,
      familyName,
      avalokitamRank: Number(row[2]),
      conditionCount: Number(row[3]),
    }
  })
  sortedGates.sort((left, right) => {
    if (left.conditionCount !== right.conditionCount) {
      return right.conditionCount - left.conditionCount
    }
    return left.avalokitamRank - right.avalokitamRank
  })
  const familyOrder = []
  for (const gate of sortedGates) {
    if (!familyOrder.includes(gate.familyName)) {
      familyOrder.push(gate.familyName)
    }
  }
  return familyOrder
}

function fallThroughEdges(overviewSource) {
  const edges = []
  const edgePattern = /(\w+)\s*(?:\[[^\]]*\])?\s*-->\|இல்லை\|\s*(\w+)/g
  for (const match of overviewSource.matchAll(edgePattern)) {
    edges.push({ fromGate: match[1], toGate: match[2] })
  }
  return edges
}

function chainFromEdges(edges) {
  const outgoing = new Map()
  const incoming = new Set()
  for (const edge of edges) {
    const existing = outgoing.get(edge.fromGate) ?? []
    existing.push(edge.toGate)
    outgoing.set(edge.fromGate, existing)
    incoming.add(edge.toGate)
  }
  const starts = [...outgoing.keys()].filter((gateId) => !incoming.has(gateId))
  if (starts.length !== 1) {
    throw new Error(`expected one chain start, found ${starts.join(', ') || 'none'}`)
  }
  const chain = [starts[0]]
  while (outgoing.has(chain[chain.length - 1])) {
    const nextGates = outgoing.get(chain[chain.length - 1])
    if (nextGates.length !== 1) {
      throw new Error(`${chain[chain.length - 1]} has ${nextGates.length} ${fallThroughLabel} outs`)
    }
    const nextGate = nextGates[0]
    if (chain.includes(nextGate)) {
      throw new Error(`cycle at ${nextGate}`)
    }
    chain.push(nextGate)
  }
  return chain
}

function overviewMermaidBlock(markdown) {
  const start = markdown.indexOf('```mermaid\n')
  const end = markdown.indexOf('\n```', start)
  if (start < 0 || end < 0) {
    throw new Error('classical-tree.md has no overview mermaid block')
  }
  return markdown.slice(start + '```mermaid\n'.length, end).trim()
}

function checkOverview() {
  const overviewSource = readFileSync(overviewPath, 'utf8').trim()
  const markdownBlock = overviewMermaidBlock(readFileSync(markdownPath, 'utf8'))
  if (markdownBlock !== overviewSource) {
    throw new Error('classical-tree.md overview mermaid block differs from classical-tree.mmd')
  }
  const edges = fallThroughEdges(overviewSource)
  const chain = chainFromEdges(edges)
  const lastNode = chain[chain.length - 1]
  if (lastNode !== terminalNode) {
    throw new Error(`chain ends at ${lastNode}, expected ${terminalNode}`)
  }
  const gateOrder = chain.slice(0, -1)
  const codeOrder = familyOrderFromTreeSource(readFileSync(treeSourcePath, 'utf8'))
  if (gateOrder.join('\n') !== codeOrder.join('\n')) {
    throw new Error(`overview gate order\n${gateOrder.join(' -> ')}\ncode order\n${codeOrder.join(' -> ')}`)
  }
  const outs = new Map()
  for (const edge of edges) {
    outs.set(edge.fromGate, (outs.get(edge.fromGate) ?? 0) + 1)
  }
  for (const gateId of gateOrder) {
    if (outs.get(gateId) !== 1) {
      throw new Error(`${gateId} has ${outs.get(gateId) ?? 0} ${fallThroughLabel} outs`)
    }
  }
  if (outs.has(terminalNode)) {
    throw new Error(`${terminalNode} should not have a ${fallThroughLabel} out-edge`)
  }
  return { gateCount: gateOrder.length, edgeCount: edges.length }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = checkOverview()
  console.log(`overview chain ok: ${result.gateCount} gates, ${result.edgeCount} ${fallThroughLabel} edges`)
}

export { checkOverview }
