const lineClassMap: Record<string, string> = {
  kuRaLaTi: 'குறளடி',
  ci_ntaTi: 'சிந்தடி',
  taVi_cco_l: 'தவிச்சொல்',
  _aLavaTi: 'அளவடி',
  neTilaTi: 'நெடிலடி',
}

const footTypeMap: Record<string, string> = {
  tEmA: 'தேமா',
  puLimA: 'புளிமா',
  kUviLa_m: 'கூவிளம்',
  karuviLa_m: 'கருவிளம்',
  mA: 'மா',
  viLa_m: 'விளம்',
}

export function getLineClassDisplay(lineClass: string): string {
  return lineClassMap[lineClass] ?? lineClass
}

export function getFootTypeDisplay(footType: string): string {
  return footTypeMap[footType] ?? footType
}
