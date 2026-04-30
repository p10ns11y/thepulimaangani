/** Coarse `linkage_type` from WASM (metre-facing family). */
const linkageTypeMap: Record<string, string> = {
  Venthalai: 'வெண்டளை',
  Aasiriyathalai: 'ஆசிரியத்தளை',
  Kalithalai: 'கலித்தளை',
  Vanjithalai: 'வஞ்சித்தளை',
  VenTalai: 'வெண்டளை',
  AsiriyaTalai: 'ஆசிரியத்தளை',
}

/** Fine `linkage_special_type` from WASM (issue #36 rows). */
const linkageSpecialMap: Record<string, string> = {
  NerondriyaAasiriyathalai: 'நேரொன்றிய ஆசிரியத்தளை',
  NiraiondriyaAasiriyathalai: 'நிரையொன்றிய ஆசிரியத்தளை',
  IyarcirVenthalai: 'இயற்சீர் வெண்டளை',
  VencirVenthalai: 'வெஞ்சீர் வெண்டளை',
  Kalithalai: 'கலித்தளை',
  OndriyaVanchithalai: 'ஒன்றிய வஞ்சித்தளை',
  OndrathaVanchithalai: 'ஒன்றாத வஞ்சித்தளை',
  Unknown: '—',
}
  kuRaLaTi: 'குறளடி',
  ci_ntaTi: 'சிந்தடி',
  taVi_cco_l: 'தவிச்சொல்',
  _aLavaTi: 'அளவடி',
  neTilaTi: 'நெடிலடி',
}

/** Logic layer `foot_type` = hyphenated Ner/Nirai pattern; values = Tamil · simple Latin. */
const footTypeMap: Record<string, string> = {
  // 1 acai
  Ner: 'மா (ma)',
  Nirai: 'விளம் (vilam)',
  // 2 acai
  'Ner-Ner': 'தேமா (thema)',
  'Ner-Nirai': 'கூவிளம் (ku vilam)',
  'Nirai-Ner': 'புளிமா (pulima)',
  'Nirai-Nirai': 'கருவிளம் (karuvilam)',
  // 3 acai
  'Ner-Ner-Ner': 'தேமாங்காய் (thema kangay)',
  'Ner-Ner-Nirai': 'தேமாகவி (thema kavi)',
  'Ner-Nirai-Ner': 'கூவிளங்காய் (ku vilam kangay)',
  'Ner-Nirai-Nirai': 'கூவிளகவி (ku vilam kavi)',
  'Nirai-Ner-Ner': 'புளிமாங்காய் (pulima kangay)',
  'Nirai-Ner-Nirai': 'புளிமாகவி (pulima kavi)',
  'Nirai-Nirai-Ner': 'கருவிளங்காய் (karuvilam kangay)',
  'Nirai-Nirai-Nirai': 'கருவிளகவி (karuvilam kavi)',
  // 4 acai
  'Ner-Ner-Ner-Ner': 'தேமாந்தப்பூ (thema thanthapuu)',
  'Ner-Ner-Ner-Nirai': 'தேமாந்தநிழல் (thema thanth nizhal)',
  'Ner-Ner-Nirai-Ner': 'தேமாரும்பூ (thema arumpuu)',
  'Ner-Ner-Nirai-Nirai': 'தேமாருநிழல் (thema aru nizhal)',
  'Ner-Nirai-Ner-Ner': 'கூவிளந்தப்பூ (ku vilam thanthapuu)',
  'Ner-Nirai-Ner-Nirai': 'கூவிளந்தநிழல் (ku vilam thanth nizhal)',
  'Ner-Nirai-Nirai-Ner': 'கூவிளரும்பூ (ku vilam arumpuu)',
  'Ner-Nirai-Nirai-Nirai': 'கூவிளருநிழல் (ku vilam aru nizhal)',
  'Nirai-Ner-Ner-Ner': 'புளிமாந்தப்பூ (pulima thanthapuu)',
  'Nirai-Ner-Ner-Nirai': 'புளிமாந்தநிழல் (pulima thanth nizhal)',
  'Nirai-Ner-Nirai-Ner': 'புளிமாரும்பூ (pulima arumpuu)',
  'Nirai-Ner-Nirai-Nirai': 'புளிமாருநிழல் (pulima aru nizhal)',
  'Nirai-Nirai-Ner-Ner': 'கருவிளந்தப்பூ (karuvilam thanthapuu)',
  'Nirai-Nirai-Ner-Nirai': 'கருவிளந்தநிழல் (karuvilam thanth nizhal)',
  'Nirai-Nirai-Nirai-Ner': 'கருவிளரும்பூ (karuvilam arumpuu)',
  'Nirai-Nirai-Nirai-Nirai': 'கருவிளருநிழல் (karuvilam aru nizhal)',
}

export function getLineClassDisplay(lineClass: string): string {
  return lineClassMap[lineClass] ?? lineClass
}

export function getFootTypeDisplay(footType: string): string {
  return footTypeMap[footType] ?? footType
}

export function getLinkageTypeDisplay(linkageType: string): string {
  return linkageTypeMap[linkageType] ?? linkageType
}

export function getLinkageSpecialDisplay(special: string): string {
  return linkageSpecialMap[special] ?? special
}
