const lineClassMap: Record<string, string> = {
  kuRaLaTi: 'குறளடி',
  ci_ntaTi: 'சிந்தடி',
  taVi_cco_l: 'தவிச்சொல்',
  _aLavaTi: 'அளவடி',
  neTilaTi: 'நெடிலடி',
}

const footTypeMap: Record<string, string> = {
  // 1 acai
  mA: 'மா',
  viLa_m: 'விளம்',
  // 2 acai (Ner=நேர், Nirai=நிரை permutations)
  tEmA: 'தேமா',
  puLimA: 'புளிமா',
  kUviLa_m: 'கூவிளம்',
  karuviLa_m: 'கருவிளம்',
  // 3 acai — காய் / கவி families (machine-first codes → Tamil labels for UI)
  tEmA_GkA_y: 'தேமாங்காய்',
  puLimA_GkA_y: 'புளிமாங்காய்',
  kUviLa_GkA_y: 'கூவிளங்காய்',
  karuviLa_GkA_y: 'கருவிளங்காய்',
  tEmA_GkaVi: 'தேமாகவி',
  puLimA_GkaVi: 'புளிமாகவி',
  kUviLa_GkaVi: 'கூவிளகவி',
  karuviLa_GkaVi: 'கருவிளகவி',
  // 4 acai — தந்தப்பூ / அரும்பூ / நிழல் / தந்தநிழல் families
  tEmA_nta_NpU: 'தேமாந்தப்பூ',
  puLimA_nta_NpU: 'புளிமாந்தப்பூ',
  kUviLa_nta_NpU: 'கூவிளந்தப்பூ',
  karuviLa_nta_NpU: 'கருவிளந்தப்பூ',
  tEmAnaRu_mpU: 'தேமாரும்பூ',
  puLimAnaRu_mpU: 'புளிமாரும்பூ',
  kUviLanaRu_mpU: 'கூவிளரும்பூ',
  karuviLanaRu_mpU: 'கருவிளரும்பூ',
  tEmAnaRuniZa_l: 'தேமாருநிழல்',
  puLimAnaRuniZa_l: 'புளிமாருநிழல்',
  kUviLanaRuniZa_l: 'கூவிளருநிழல்',
  karuviLanaRuniZa_l: 'கருவிளருநிழல்',
  tEmA_nta_NNiZa_l: 'தேமாந்தநிழல்',
  puLimA_nta_NNiZa_l: 'புளிமாந்தநிழல்',
  kUviLa_nta_NNiZa_l: 'கூவிளந்தநிழல்',
  karuviLa_nta_NNiZa_l: 'கருவிளந்தநிழல்',
  unknown: 'அறியப்படாத சீர்',
}

export function getLineClassDisplay(lineClass: string): string {
  return lineClassMap[lineClass] ?? lineClass
}

export function getFootTypeDisplay(footType: string): string {
  return footTypeMap[footType] ?? footType
}
