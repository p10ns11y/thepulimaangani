/** Machine ids for poem samples: each string literal appears once; reuse for `en` and example lookup. */
const ORU_VIKARPA_KURAL_VENPAA = 'oru_vikarpa_kural_venpaa';
const IRU_VIKARPA_KURAL_VENPAA = 'iru_vikarpa_kural_venpaa';
const NERISAI_SINTHIYAL_VENPAA = 'nerisai_sinthiyal_venpaa';
const INISAI_SINTHIYAL_VENPAA = 'inisai_sinthiyal_venpaa';
const ORU_VIKARPA_NERISAI_VENPAA = 'oru_vikarpa_nerisai_venpaa';
const IRU_VIKARPA_NERISAI_VENPAA = 'iru_vikarpa_nerisai_venpaa';
const ORU_VIKARPA_INISAI_VENPAA = 'oru_vikarpa_inisai_venpaa';
const PALA_VIKARPA_INISAI_VENPAA = 'pala_vikarpa_inisai_venpaa';
const PAQRODAI_VENPAA = 'paqrodai_venpaa';
const KALIVENPAA = 'kalivenpaa';
const NERISAI_ACIRIYAPPAA = 'nerisai_aciriyappaa';
const INAIKKURAL_ACIRIYAPPAA = 'inaikkural_aciriyappaa';
const NILAIMANDILA_ACIRIYAPPAA = 'nilaimandila_aciriyappaa';
const THARAVUKOCHA_KALIPPAA = 'tharavukocha_kalippaa';
const VENKALIPPAA = 'venkalippaa';
const KURALADI_VANJIPPAA = 'kuraladi_vanjippaa';
const SINTHADI_ACIRIYAPPAA = 'sinthadi_aciriyappaa';
const KURATTAZHISAI = 'kurattazhisai';
const KURAL_VENSENTHURAI = 'kural_vensenthurai';
const VENTAZHISAI = 'ventazhisai';
const VELLATHAZHISAI = 'vellathazhisai';
const VENDURAI = 'vendurai';
const VELIVIRUTHAM = 'velivirutham';
const ACIRIYA_THAZHISAI = 'aciriya_thazhisai';
const ACIRIYA_THURAI = 'aciriya_thurai';
const ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM = 'arucir_kazhinediladi_aciriya_virutham';
const ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM = 'elucir_kazhinediladi_aciriya_virutham';
const ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM = 'encir_kazhinediladi_aciriya_virutham';
const KALITHAZHISAI = 'kalithazhisai';
const KALITHURAI = 'kalithurai';
const KATTALAI_KALIPPAA = 'kattalai_kalippaa';
const KATTALAI_KALITHURAI = 'kattalai_kalithurai';
const KALIVIRUTHAM = 'kalivirutham';
const VANJITHAZHISAI = 'vanjithazhisai';
const VANJITHURAI = 'vanjithurai';
const VANJIVIRUTHAM = 'vanjivirutham';

const VENPAA = 'venpaa';
const ACIRIYAPPA = 'aciriyappa';
const KALIPPAA = 'kalippaa';
const VANJIPPAA = 'vanjippaa';

const poemVariationExamples = {
  [ORU_VIKARPA_KURAL_VENPAA]: `முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்
குற்றமொன்று இல்லா அறம்`,
  [IRU_VIKARPA_KURAL_VENPAA]: `நற்காட்சி நன்ஞானம் நல்லொழுக்கம் இம்மூன்றும்
தொக்க அறச்சொல் பொருள்`,
  [NERISAI_SINTHIYAL_VENPAA]: `அறிந்தானை ஏத்தி அறிவாங் கறிந்து
செறிந்தார்க்குச் செவ்வன் உரைப்ப - செறிந்தார்
சிறந்தமை ஆராய்ந்து கொண்டு`,
  [INISAI_SINTHIYAL_VENPAA]: `சுரையாழ அம்மி மிதப்ப வரையனைய
யானைக்கு நீத்து முயற்கு நிலையென்ப
கானக நாடன் சுனை`,
  [ORU_VIKARPA_NERISAI_VENPAA]: `கூற்றங் குமைத்த குரைகழற்காற் கும்பிட்டுத்
தோற்றந் துடைத்தேந் துடைத்தேமாற் - சீற்றஞ்செய்
யேற்றினான் றில்லை யிடத்தினா னென்னினியாம்
போற்றினா னல்கும் பொருள்`,
  [IRU_VIKARPA_NERISAI_VENPAA]: `மாதவா போதி வரதா வருளமலா
பாதமே யோத சுரரைநீ - தீதகல
மாயா நெறியளிப்பா யின்றன் பகலாச்சீர்த்
தாயே யலகில்லா டாம்`,
  [ORU_VIKARPA_INISAI_VENPAA]: `துகடீர் பெருஞ்செல்வம் தோன்றியக்கால் தொட்டுப்
பகடு நடந்தகூழ் பல்லாரோ டுண்க
அகடுற யார்மாட்டும் நில்லாது செல்வம்
சகடக்கால் போல வரும்`,
  [PALA_VIKARPA_INISAI_VENPAA]: `இன்றுகொல் அன்றுகொல் என்றுகொல் என்னாது
பின்றையே நின்றது கூற்றமென் றெண்ணி
ஒருவுமின் தீயவை ஒல்லும் வகையான்
மருவுமின் மாண்டார் அறம்`,
  [PAQRODAI_VENPAA]: `வையக மெல்லாங் கழினியா வையகத்துட்
செய்யகமே நாற்றிசையின் றேயங்கள் செய்யகத்துள்
வான்கரும்பே தொண்டை வளநாடு வான்கரும்பின்
சாறேயந் நாட்டிற் றிலையூர்கள் சாறட்ட
கட்டியே கச்சிப் புறமெல்லாங்க் கட்டியுட்
டானேற்ற மான சருக்கரை மாமணியே
ஆணேற்றான் கச்சி யகம்`,
  [KALIVENPAA]: `சுடர்த்தொடீஇ கேளாய் தெருவில்நாம் ஆடும்
மணற்சிற்றில் காலில் சிதையா அடைச்சிய
கோதை பரிந்து வரிப்பந்து கொண்டோடி
நோதக்க செய்யும் சிறுபட்டி மேல்ஓர்நாள்
அன்னையும் யானும் இருந்தேமா இல்லிரே
உண்ணுநீர் வேட்டேன் எனவந்தாற் கன்னை
அடர்பொற் சிரகத்தால் வாக்கிச் சுடரிழாய்
உண்ணுநீர் ஊட்டிவா என்றாள் எனயானும்
தன்னை அறியாது சென்றேன்மற் றென்னை
வளைமுன்கை பற்றி நலியத் தெருமந்திட்(டு)
அன்னாய் இவனொருவன் செய்ததுகாண்’ என்றேனா
அன்னை அலறிப் படர்தரத் தன்னையான்
உண்ணுநீர் விக்கினான் என்றேனா அன்னையும்
தன்னைப் புறம்பழித்து நீவமற் றென்னைக்
கடைக்கணால் கொல்வான்போல் நோக்கி நகைக்கூட்டம்
செய்தானக் கள்வன் மகன்`,
  [NERISAI_ACIRIYAPPAA]: `அருள்வீற் றிருந்த திருநிழற் போதி
முழுதுணர் முனிவநிற் பரவுதும் தொழுதக
ஒருமனம் எய்தி இருவினைப் பிணிவிட்டு
முப்பகை கடந்து நால்வகைப் பொருளுணர்ந்
தோங்குநீர் உலகிடை யாவரும்
நீங்கா இன்பமொடு நீடுவாழ் கெனவே`,
  [INAIKKURAL_ACIRIYAPPAA]: `நீரின் தண்மையும் தீயின் வெம்மையும்
சாரச் சார்ந்து
தீரத் தீரும்
சாரல் நாடன் கேண்மை
சாரச் சாரச் சார்ந்து
தீரத் தீரத் தீர்பொல் லாதே`,
  [NILAIMANDILA_ACIRIYAPPAA]: `புலவன் தீர்த்தன் புண்ணியன் புராணன்
உலக நோன்பி னுயர்ந்தோன் வென்கோ
குற்றங் கெடுத்தோய் செற்றஞ் செறுத்தோய்
முற்ற வுணர்ந்த முதல்வா வென்கோ
காமற் கடந்தோய் ஏம மாயோய்
தீநெறிக் கடும்பகை கடுந்தோ யென்கோ
ஆயிர வாரத் தாழியந் திருந்தடி
நாவா யிரமிலேன் ஏத்துவ தெவனோ
`,
  [THARAVUKOCHA_KALIPPAA]: `செல்வப்போர்க் கதக்கண்ணன் செயிர்த்தெறிந்த சினவாழி
முல்லைத்தார் மறமன்னர் முடித்தலையை முருக்கிப்போய்
எல்லைநீர் வியன்கொண்மூ இடைநுழையும் மதியம்போல்
மல்லல்ஒங் கெழில்யானை மருமம்பாய்ந் தொளித்ததே
`,
  [VENKALIPPAA]: `ஏர்மலர் நறுங்கோதை எருத்தலைப்ப இறைஞ்சித்தன்
வார்மலர்த் தடங்கண்ணார் வலைப்பட்டு வருந்தியவென்
தார்வரை அகன்மார்பன் தனிமையை அறியுங்கொல்
சீர்மலி கொடியிடை சிறந்து
`,
  [KURALADI_VANJIPPAA]: `மாகத்தினர் மாண்புவியினர்
யோகத்தினர் உரைமறையினர்
ஞானத்தினர் நயஆகமப்
பேரறிவினர் பெருநூலினர்
காணத்தகு பல்கணத்தினர்
என்றே
இன்னன பல்லோர் ஏத்தும் பெருமான்
மன்னவன் காந்த மலையுறை முருகனே`,
  [SINTHADI_ACIRIYAPPAA]: `கொடிவாலன குருநிறத்தன குறுந்தாளன
வடிவாலெயிற் றழலுளையன வள்ளுகிரன
பணையெருத்தின் இணையரிமான் அணையேறித்
துணையில்லாத் துறவுநெறிக் கிறைவனாகி
எயினடுவண் இனிதிருந் தெல்லோர்க்கும்
பயில்படுவினை பத்தியலாற் செப்பியோன்
புணையெனத்
திருவுறு திருந்தடி திசைதொழ
வெருவுறும் நாற்கதி; வீடுநனி எளிதே`,
  [KURATTAZHISAI]: `நண்ணு வார்வினை நைய நாடொறும் நற்ற வர்க்கர சாய ஞானநல்
கண்ணி னானடி யேயடை வார்கள் கற்றவரே`,
  [KURAL_VENSENTHURAI]: `போதிநிழற் புனிதன் பொலங்கழல்
ஆதி உலகிற் காண்`,
  [VENTAZHISAI]: `நண்பி தென்று தீய சொல்லார்
முன்பு நின்று முனிவு செய்யார்
அன்பு வேண்டு பவர்`,
  [VELLATHAZHISAI]: `ஏரினைப் போற்றுதும்! ஏரினைப் போற்றுதும்!
பாருல கத்தோர் பசிப்பிணிக் கோர்மருந்தாய்
ஆருயி ரோம்புத லான்

கைத்தொழில் போற்றுதும் கைத்தொழில் போற்றுதும்
ஒத்துல கத்தே உயர்வாழ்வுக் கானபொருள்
அத்தனையுந் தான்தருத லான்

வாணிகம் போற்றுதும் வாணிகம் போற்றுதும்
ஏணிபோல் எப்பொருளும் எங்கும்இல் லென்னாமே
ஆணிபோ லேதருத லான்`,
  [VENDURAI]: `படர்தருவெவ் வினைத்தொடர்பாற் பவத்தொடர்பப் பவதொடர்பாற் படராநிற்கும்
விடலரும்வெவ் வினைத்தொடர்பவ் வினைத்தொடர்புக் கொழிபுண்டோ வினையேற்கம்மா
விடர்பெரிது முடையேன்மற் றென்செய்கே னென்செய்கே
னடலரவ மரைக்கசைத்த வடிகேளோ வடிகேளோ`,
  [VELIVIRUTHAM]: `மருள்அறுத்த பெரும்போதி மாதவரைக் கண்டிலனால்! - என்செய்கோயான்!
அருள்இருந்த திருமொழியால் அறவழக்கங் கேட்டிலனால்! - என்செய்கோயான்!
பொருள்அறியும் அருந்தவத்துப் புரவலரைக் கண்டிலனால்! - என்செய்கோயான்!`,
  [ACIRIYA_THAZHISAI]: `வானுற நிமிர்ந்தனை வையகம் அளந்தனை
பான்மதி விடுத்தனை பல்லுயிர் ஓம்பினை
நீனிற வண்ணநின் நிரைகழல் தொழுதனம்`,
  [ACIRIYA_THURAI]: `இரங்கு குயில்முழவா இன்னிசையாழ் தேனா
அரங்கு மணிபொழிலா ஆடும் போலும் இளவேனில்
அரங்கு மணிபொழிலா ஆடு மாயின்
மரங்கொல் மணந்தகன்றார் நெஞ்சமென் செய்த திளவேனில்`,
  [ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM]: `தொழும்அடியர் இதயமலர் ஒருபொழுதும் பிரிவரிய துணைவர் எனலாம்
எழும்இரவி கிரணநிகர் இலகுதுகில் புனைசெய்தருள் இறைவர் இடமாம்
குழுவுமறை யவருமுனி வரருமரி பிரமருர கவனும் எவரும்
தொழுகைய இமையவரும் அறம்மருவு துதிசெய்தெழு துடித புரமே!`,
  [ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM]: `
தோடார் இலங்கு மலர்கோதி வண்டு வரிபாட நீடு துணர்சேர்
வாடாத போதி நெறிநீழல் மேய வரதன் பயந்த அறநூல்
கோடாத சீல விதமேவி வாய்மை குணனாக நாளும் முயல்வார்
வீடாத இன்ப நெறிசேர்வர்! துன்ப வினைசேர்தல் நாளும் இலரே
          `,
  [ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM]: `எண்டிசையும் ஆகி இருள்அகல நூறி எழுதளிர்கள் சோதி முழுதுலகம் நாறி
வண்டிசைகள் பாடி மதுமலர்கள் வேய்ந்து மழைமருவு போதி உழைநிழல்கொள் வாமன்
வெண்டிரையின் மீது விரிகதிர்கள் காண வெறிதழல்கொள் மேனி அறிவனெழில் மேவு
புண்டரிக பாதம் நமசரனம் ஆகும் எனமுனிவர் தீமை புணர்பிறவி காணார்`,
  [KALITHAZHISAI]: `வாள்வரி வேங்கை வழங்கும் சிறுநெறிஎம்
கேள்வரும் போழ்தில் எழால்வாழி வெண்திங்காள்
கேள்வரும் போழ்தில் எழாலாய்க் குறாலியரோ
நீள்வரி நாகத் தெயிறே வாழி வெண்திங்காள்`,
  [KALITHURAI]: `ஆவி அந்துகில் புனைவதொன் றன்றிவே றறியாள்
தூவி அன்னமென் புனலிடைத் தோய்கிலா மெய்யாள்
தேவு தெண்கடல் அமிழ்துகொண் டனங்கவேள் செய்த
ஓவி யம்புகை யுண்டதே ஒக்கின்ற உருவாள்`,
  [KATTALAI_KALIPPAA]: `அன்னை யெத்தனை யெத்தனை அன்னையோ
அப்ப னெத்தனை யெத்தனை அப்பனோ
பின்னை யெத்தனை யெத்தனை பெண்டிரோ
பிள்ளை யெத்தனை யெத்தனை பிள்ளையோ
முன்னை யெத்தனை யெத்தனை சென்மமோ
மூட மாயடி யேனும றிந்திலேன்
இன்னு மெத்தனை யெத்தனை சென்மமோ
என்செய் வேன்கச்சி யேகம்ப நாதனே`,
  [KATTALAI_KALITHURAI]: `தனந்தரும் கல்வி தருமொரு நாளும் தளர்வறியா
மனந்தரும் தெய்வ வடிவும் தரும்நெஞ்சில் வஞ்சமில்லா
இனந்தரும் நல்லன எல்லாம் தருமன்பர் என்பவர்க்கே
கனந்தரும் பூங்குழ லாளபி ராமி கடைக்கண்களே`,
  [KALIVIRUTHAM]: `பேணநோற் றதுமனைப் பிறவி பெண்மைபோல்
நாணநோற் றுயர்ந்தது நங்கை தோன்றலான்
மாணநோற் றீண்டிவள் இருந்த வாறெலாம்
காணநோற் றிலனவன் கமலக் கண்களால்`,
  [VANJITHAZHISAI]: `மடப்பிடியை மதவேழம்
தடக்கையான் வெயில்மறைக்கும்
இடைச்சுரம் இறந்தார்க்கே
நடக்குமென் மனனேகாண்

பேடையை இரும்போத்துத்
தோகையான் வெயில்மறைக்கும்
காடகம் இறந்தார்க்கே
ஓடுமென் மனனேகாண்

இரும்பிடியை இகல்வேழம்
பெருங்கையான் வெயில்மறைக்கும்
அருஞ்சுரம் இறந்தார்க்கே
விரும்புமென் மனனேகாண்`,
  [VANJITHURAI]: `பொருந்து போதியில்
இருந்த மாதவர்
திருந்து சேவடி
மருந்து ஆகுமே`,
  [VANJIVIRUTHAM]: `அணிதங்கு போதி வாமன்
பணிதங்கு பாதம் அல்லால்
துணிபொன் றிலாத தேவர்
மணிதங்கு பாதம் மேவார்`,
};

/** Tamil display label per sample id (same keys as `poemVariationExamples`). */
const tamilKeys = {
  [ORU_VIKARPA_KURAL_VENPAA]: 'ஒரு விகற்ப குறள் வெண்பா',
  [IRU_VIKARPA_KURAL_VENPAA]: 'இரு விகற்ப குறள் வெண்பா',
  [NERISAI_SINTHIYAL_VENPAA]: 'நேரிசை சிந்தியல் வெண்பா',
  [INISAI_SINTHIYAL_VENPAA]: 'இன்னிசை சிந்தியல் வெண்பா',
  [ORU_VIKARPA_NERISAI_VENPAA]: 'ஒரு விகற்ப நேரிசை வெண்பா',
  [IRU_VIKARPA_NERISAI_VENPAA]: 'இரு விகற்ப நேரிசை வெண்பா',
  [ORU_VIKARPA_INISAI_VENPAA]: 'ஒரு விகற்ப இன்னிசை வெண்பா',
  [PALA_VIKARPA_INISAI_VENPAA]: 'பல விகற்ப இன்னிசை வெண்பா',
  [PAQRODAI_VENPAA]: 'பஃறொடை வெண்பா',
  [KALIVENPAA]: 'கலிவெண்பா',
  [NERISAI_ACIRIYAPPAA]: 'நேரிசை ஆசிரியப்பா',
  [INAIKKURAL_ACIRIYAPPAA]: 'இணைக்குறள் ஆசிரியப்பா',
  [NILAIMANDILA_ACIRIYAPPAA]: 'நிலைமண்டில ஆசிரியப்பா',
  [THARAVUKOCHA_KALIPPAA]: 'தரவுகொச்சகக் கலிப்பா',
  [VENKALIPPAA]: 'வெண்கலிப்பா',
  [KURALADI_VANJIPPAA]: 'குறளடி வஞ்சிப்பா',
  [SINTHADI_ACIRIYAPPAA]: 'சிந்தடி வஞ்சிப்பா',
  [KURATTAZHISAI]: 'குறட்டாழிசை',
  [KURAL_VENSENTHURAI]: 'குறள் வெண்செந்துறை',
  [VENTAZHISAI]: 'வெண்டாழிசை',
  [VELLATHAZHISAI]: 'வெள்ளொத்தாழிசை',
  [VENDURAI]: 'வெண்டுறை',
  [VELIVIRUTHAM]: 'வெளிவிருத்தம்',
  [ACIRIYA_THAZHISAI]: 'ஆசிரியத் தாழிசை',
  [ACIRIYA_THURAI]: 'ஆசிரியத் துறை',
  [ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM]: 'அறுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்',
  [ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM]: 'எழுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்',
  [ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM]: 'எண்சீர் கழிநெடிலடி ஆசிரிய விருத்தம்',
  [KALITHAZHISAI]: 'கலித்தாழிசை',
  [KALITHURAI]: 'கலித்துறை',
  [KATTALAI_KALIPPAA]: 'கட்டளை கலிப்பா',
  [KATTALAI_KALITHURAI]: 'கட்டளை கலித்துறை',
  [KALIVIRUTHAM]: 'கலிவிருத்தம்',
  [VANJITHAZHISAI]: 'வஞ்சித்தாழிசை',
  [VANJITHURAI]: 'வஞ்சித்துறை',
  [VANJIVIRUTHAM]: 'வஞ்சி விருத்தம்',
};

/** @param {string} key */
function variationRow(key) {
  const ta = tamilKeys[key];
  if (ta === undefined) {
    throw new Error(`tamilKeys missing for sample id: ${key}`);
  }
  return { en: key, ta, example: poemVariationExamples[key] };
}

const poemVariations = {
  [VENPAA]: {
    special_types: [
      variationRow(ORU_VIKARPA_KURAL_VENPAA),
      variationRow(IRU_VIKARPA_KURAL_VENPAA),
      variationRow(NERISAI_SINTHIYAL_VENPAA),
      variationRow(INISAI_SINTHIYAL_VENPAA),
      variationRow(ORU_VIKARPA_NERISAI_VENPAA),
      variationRow(IRU_VIKARPA_NERISAI_VENPAA),
      variationRow(ORU_VIKARPA_INISAI_VENPAA),
      variationRow(PALA_VIKARPA_INISAI_VENPAA),
      variationRow(PAQRODAI_VENPAA),
      variationRow(KALIVENPAA),
    ],
    variations: [
      variationRow(KURATTAZHISAI),
      variationRow(KURAL_VENSENTHURAI),
      variationRow(VENTAZHISAI),
      variationRow(VELLATHAZHISAI),
      variationRow(VENDURAI),
      variationRow(VELIVIRUTHAM),
    ],
  },
  [ACIRIYAPPA]: {
    special_types: [
      variationRow(NERISAI_ACIRIYAPPAA),
      variationRow(INAIKKURAL_ACIRIYAPPAA),
      variationRow(NILAIMANDILA_ACIRIYAPPAA),
    ],
    variations: [
      variationRow(ACIRIYA_THAZHISAI),
      variationRow(ACIRIYA_THURAI),
      variationRow(ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM),
      variationRow(ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM),
      variationRow(ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM),
    ],
  },
  [KALIPPAA]: {
    special_types: [
      variationRow(THARAVUKOCHA_KALIPPAA),
      variationRow(VENKALIPPAA),
    ],
    variations: [
      variationRow(KALITHAZHISAI),
      variationRow(KALITHURAI),
      variationRow(KATTALAI_KALIPPAA),
      variationRow(KATTALAI_KALITHURAI),
      variationRow(KALIVIRUTHAM),
    ],
  },
  [VANJIPPAA]: {
    special_types: [
      variationRow(KURALADI_VANJIPPAA),
      variationRow(SINTHADI_ACIRIYAPPAA),
    ],
    variations: [
      variationRow(VANJITHAZHISAI),
      variationRow(VANJITHURAI),
      variationRow(VANJIVIRUTHAM),
    ],
  },
};

export {
  poemVariations,
  poemVariationExamples,
  tamilKeys,
};

/*
 * Archived alternate samples (same metre labels as current ACIRIYA_THAZHISAI / KALITHAZHISAI;
 * not wired — single active sample per id in poemVariationExamples above).
 *
 * --- Alternate ஆசிரியத் தாழிசை (was second row under same label) ---
 * [ACIRIYA_THAZHISAI alternate]:
 * `கன்று குணிலாக் கனியுகுத்த மாயவன்
 * இன்றுநம் ஆனுள் வருமேல் அவன்வாயில்
 * கொன்றையம் தீங்குழல் கேளாமோ தோழி
 *
 * பாம்பு கயிறாக் கடல்கடைந்த மாயவன்
 * ஈங்குநம் ஆனுள் வருமேல் அவன்வாயில்
 * ஆம்பலந் தீங்குழல் கேளாமோ தோழி
 *
 * கொல்லையஞ் சாரல் குருந்தொசித்த மாயவன்
 * எல்லிநம் ஆனுள் வருமேல் அவன்வாயில்
 * முல்லையந் தீங்குழல் கேளாமோ தோழி`
 *
 * --- Alternate கலித்தாழிசை (was second row under same label) ---
 * [KALITHAZHISAI alternate]:
 * `கொய்தினை காத்தும் குளவி அடுக்கத்தெம்
 * பொய்தல் சிறுகுடி வாரல்நீ ஐய நலம்வேண்டின்
 *
 * ஆய்தினை காத்தும் அருவி அடுக்கத்தெம்
 * மாசில் சிறுகுடி வாரல்நீ ஐய நலம்வேண்டின்
 *
 * மென்தினை காத்தும் மிகுபூங் கமழ்சோலைக்
 * குன்றச் சிறுகுடி வாரல்நீ ஐய நலம்வேண்டின்`
 */

