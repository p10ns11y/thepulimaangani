/**
 * Physical-line vs structured feet layout (editor preview, blank stanza rows).
 */
export {
  feetPerPhysicalLine,
  groupsFromFeet,
} from '#/lib/prosody/layout/parserFeetLayout'
export {
  lineWordsForDisplay,
  mapFeetToPhysicalLines,
  physicalPoemLines,
} from '#/lib/prosody/layout/mapFeetToPhysicalLines'
export {
  getChangedLineIndices,
  lineDiffOps,
  normLines,
  syllableCountsPerPhysicalLine,
  type LineDiffOp,
} from '#/lib/prosody/layout/poemLineDiff'
