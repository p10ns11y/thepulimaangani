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
  VencirVenthalai: 'வெண்சீர் வெண்டளை',
  Kalithalai: 'கலித்தளை',
  OndriyaVanchithalai: 'ஒன்றிய வஞ்சித்தளை',
  OndrathaVanchithalai: 'ஒன்றாத வஞ்சித்தளை',
  Unknown: '—',
}

/** Machine `line_class` → Tamil label. Prefer simple transliteration keys; legacy Avalokitam-style keys kept as aliases. */
const lineClassMap: Record<string, string> = {
  Kuraladi: 'குறளடி',
  Cinthadi: 'சிந்தடி',
  Thanichol: 'தனிச்சொல்',
  Alavadi: 'அளவடி',
  Nediladi: 'நெடிலடி',
  // Legacy keys (same labels)
  kuRaLaTi: 'குறளடி',
  ci_ntaTi: 'சிந்தடி',
  taVi_cco_l: 'தனிச்சொல்',
  _aLavaTi: 'அளவடி',
  neTilaTi: 'நெடிலடி',
}

/** Logic layer `foot_type` = hyphenated Ner/Nirai pattern; Tamil aligns with feet-calculations.md. */
const footTypeMap: Record<string, string> = {
  // 1 acai
  Ner: 'மா (ma)',
  Nirai: 'விளம் (vilam)',
  // 2 acai
  'Ner-Ner': 'தேமா (thema)',
  'Ner-Nirai': 'கூவிளம் (kuivilam)',
  'Nirai-Ner': 'புளிமா (pulima)',
  'Nirai-Nirai': 'கருவிளம் (karuvilam)',
  // 3 acai (மூவசை)
  'Ner-Ner-Ner': 'தேமாங்காய் (themaangkaay)',
  'Ner-Ner-Nirai': 'தேமாங்கனி (themaangkani)',
  'Ner-Nirai-Ner': 'கூவிளங்காய் (kuivilangkaay)',
  'Ner-Nirai-Nirai': 'கூவிளங்கனி (kuivilangkani)',
  'Nirai-Ner-Ner': 'புளிமாங்காய் (pulimaangkaay)',
  'Nirai-Ner-Nirai': 'புளிமாங்கனி (pulimaangkani)',
  'Nirai-Nirai-Ner': 'கருவிளங்காய் (karuvilangkaay)',
  'Nirai-Nirai-Nirai': 'கருவிளங்கனி (karuvilangkani)',
  // 4 acai (நான்கசை)
  'Ner-Ner-Ner-Ner': 'தேமாந்தண்பூ (themaanthanpuu)',
  'Ner-Ner-Ner-Nirai': 'தேமாந்தண்ணிழல் (themaanthannizhal)',
  'Ner-Ner-Nirai-Ner': 'தேமாநறும்பூ (themanarumpuu)',
  'Ner-Ner-Nirai-Nirai': 'தேமாநறுநிழல் (themanarunizhal)',
  'Ner-Nirai-Ner-Ner': 'கூவிளந்தண்பூ (kuivilanthanpuu)',
  'Ner-Nirai-Ner-Nirai': 'கூவிளந்தண்ணிழல் (kuivilanthannizhal)',
  'Ner-Nirai-Nirai-Ner': 'கூவிளநறும்பூ (kuivilanarumpuu)',
  'Ner-Nirai-Nirai-Nirai': 'கூவிளநறுநிழல் (kuivilanarunizhal)',
  'Nirai-Ner-Ner-Ner': 'புளிமாந்தண்பூ (pulimaanthanpuu)',
  'Nirai-Ner-Ner-Nirai': 'புளிமாந்தண்ணிழல் (pulimaanthannizhal)',
  'Nirai-Ner-Nirai-Ner': 'புளிமாநறும்பூ (pulimanarumpuu)',
  'Nirai-Ner-Nirai-Nirai': 'புளிமாநறுநிழல் (pulimanarunizhal)',
  'Nirai-Nirai-Ner-Ner': 'கருவிளந்தண்பூ (karuvilanthanpuu)',
  'Nirai-Nirai-Ner-Nirai': 'கருவிளந்தண்ணிழல் (karuvilanthannizhal)',
  'Nirai-Nirai-Nirai-Ner': 'கருவிளநறும்பூ (karuvilanarumpuu)',
  'Nirai-Nirai-Nirai-Nirai': 'கருவிளநறுநிழல் (karuvilanarunizhal)',
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
