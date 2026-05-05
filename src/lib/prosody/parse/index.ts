/**
 * Parsed-poem linkage helpers (indices + overview rows). Lives next to WASM adaptation.
 */
export {
  anchorPairForLinkageEdge,
  lineWordForGlobalFootIndex,
} from '#/lib/prosody/parse/footPositionFromLines'
export {
  buildLinkageOverviewRows,
  linkageCoarseCounts,
  type LinkageOverviewRow,
} from '#/lib/prosody/parse/linkageOverview'
