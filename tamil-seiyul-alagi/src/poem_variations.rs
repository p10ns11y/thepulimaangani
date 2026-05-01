//! Canonical poem sample metadata aligned with [`data/poem_variations.js`](../../data/poem_variations.js)
//! at the repository root. When updating samples, keep this module and that file in sync.

use serde::{Deserialize, Serialize};

// --- Sample ids (`en` keys, same as JS) ------------------------------------

pub const ORU_VIKARPA_KURAL_VENPAA: &str = "oru_vikarpa_kural_venpaa";
pub const IRU_VIKARPA_KURAL_VENPAA: &str = "iru_vikarpa_kural_venpaa";
pub const NERISAI_SINTHIYAL_VENPAA: &str = "nerisai_sinthiyal_venpaa";
pub const INISAI_SINTHIYAL_VENPAA: &str = "inisai_sinthiyal_venpaa";
pub const ORU_VIKARPA_NERISAI_VENPAA: &str = "oru_vikarpa_nerisai_venpaa";
pub const IRU_VIKARPA_NERISAI_VENPAA: &str = "iru_vikarpa_nerisai_venpaa";
pub const ORU_VIKARPA_INISAI_VENPAA: &str = "oru_vikarpa_inisai_venpaa";
pub const PALA_VIKARPA_INISAI_VENPAA: &str = "pala_vikarpa_inisai_venpaa";
pub const PAQRODAI_VENPAA: &str = "paqrodai_venpaa";
pub const KALIVENPAA: &str = "kalivenpaa";
pub const NERISAI_ACIRIYAPPAA: &str = "nerisai_aciriyappaa";
pub const INAIKKURAL_ACIRIYAPPAA: &str = "inaikkural_aciriyappaa";
pub const NILAIMANDILA_ACIRIYAPPAA: &str = "nilaimandila_aciriyappaa";
pub const THARAVUKOCHA_KALIPPAA: &str = "tharavukocha_kalippaa";
pub const VENKALIPPAA: &str = "venkalippaa";
pub const KURALADI_VANJIPPAA: &str = "kuraladi_vanjippaa";
pub const SINTHADI_ACIRIYAPPAA: &str = "sinthadi_aciriyappaa";
pub const KURATTAZHISAI: &str = "kurattazhisai";
pub const KURAL_VENSENTHURAI: &str = "kural_vensenthurai";
pub const VENTAZHISAI: &str = "ventazhisai";
pub const VELLATHAZHISAI: &str = "vellathazhisai";
pub const VENDURAI: &str = "vendurai";
pub const VELIVIRUTHAM: &str = "velivirutham";
pub const ACIRIYA_THAZHISAI: &str = "aciriya_thazhisai";
pub const ACIRIYA_THURAI: &str = "aciriya_thurai";
pub const ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "arucir_kazhinediladi_aciriya_virutham";
pub const ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "elucir_kazhinediladi_aciriya_virutham";
pub const ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "encir_kazhinediladi_aciriya_virutham";
pub const KALITHAZHISAI: &str = "kalithazhisai";
pub const KALITHURAI: &str = "kalithurai";
pub const KATTALAI_KALIPPAA: &str = "kattalai_kalippaa";
pub const KATTALAI_KALITHURAI: &str = "kattalai_kalithurai";
pub const KALIVIRUTHAM: &str = "kalivirutham";
pub const VANJITHAZHISAI: &str = "vanjithazhisai";
pub const VANJITHURAI: &str = "vanjithurai";
pub const VANJIVIRUTHAM: &str = "vanjivirutham";

/// Metre group keys (`venpaa`, `aciriyappa`, `kalippaa`, `vanjippaa`).
pub const VENPAA: &str = "venpaa";
pub const ACIRIYAPPA: &str = "aciriyappa";
pub const KALIPPAA: &str = "kalippaa";
pub const VANJIPPAA: &str = "vanjippaa";

/// One row in `special_types` or `variations` (matches JS `variationRow` shape).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct PoemVariationRow {
    pub en: &'static str,
    pub ta: &'static str,
    pub example: &'static str,
}

/// Grouped samples for a parent metre (matches JS `poemVariations[metre]`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PoemVariationsBlock {
    pub metre_key: &'static str,
    pub special_types: &'static [PoemVariationRow],
    pub variations: &'static [PoemVariationRow],
}

// --- Example texts (must match `poemVariationExamples` in JS) --------------

const EX_ORU_VIKARPA_KURAL_VENPAA: &str = "முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்";

const EX_IRU_VIKARPA_KURAL_VENPAA: &str = "நற்காட்சி நன்ஞானம் நல்லொழுக்கம் இம்மூன்றும்\nதொக்க அறச்சொல் பொருள்";

const EX_NERISAI_SINTHIYAL_VENPAA: &str = "அறிந்தானை ஏத்தி அறிவாங் கறிந்து\nசெறிந்தார்க்குச் செவ்வன் உரைப்ப - செறிந்தார்\nசிறந்தமை ஆராய்ந்து கொண்டு";

const EX_INISAI_SINTHIYAL_VENPAA: &str = "சுரையாழ அம்மி மிதப்ப வரையனைய\nயானைக்கு நீத்து முயற்கு நிலையென்ப\nகானக நாடன் சுனை";

const EX_ORU_VIKARPA_NERISAI_VENPAA: &str = "கூற்றங் குமைத்த குரைகழற்காற் கும்பிட்டுத்\nதோற்றந் துடைத்தேந் துடைத்தேமாற் - சீற்றஞ்செய்\nயேற்றினான் றில்லை யிடத்தினா னென்னினியாம்\nபோற்றினா னல்கும் பொருள்";

const EX_IRU_VIKARPA_NERISAI_VENPAA: &str = "மாதவா போதி வரதா வருளமலா\nபாதமே யோத சுரரைநீ - தீதகல\nமாயா நெறியளிப்பா யின்றன் பகலாச்சீர்த்\nதாயே யலகில்லா டாம்";

const EX_ORU_VIKARPA_INISAI_VENPAA: &str = "துகடீர் பெருஞ்செல்வம் தோன்றியக்கால் தொட்டுப்\nபகடு நடந்தகூழ் பல்லாரோ டுண்க\nஅகடுற யார்மாட்டும் நில்லாது செல்வம்\nசகடக்கால் போல வரும்";

const EX_PALA_VIKARPA_INISAI_VENPAA: &str = "இன்றுகொல் அன்றுகொல் என்றுகொல் என்னாது\nபின்றையே நின்றது கூற்றமென் றெண்ணி\nஒருவுமின் தீயவை ஒல்லும் வகையான்\nமருவுமின் மாண்டார் அறம்";

const EX_PAQRODAI_VENPAA: &str = "வையக மெல்லாங் கழினியா வையகத்துட்\nசெய்யகமே நாற்றிசையின் றேயங்கள் செய்யகத்துள்\nவான்கரும்பே தொண்டை வளநாடு வான்கரும்பின்\nசாறேயந் நாட்டிற் றிலையூர்கள் சாறட்ட\nகட்டியே கச்சிப் புறமெல்லாங்க் கட்டியுட்\nடானேற்ற மான சருக்கரை மாமணியே\nஆணேற்றான் கச்சி யகம்";

const EX_KALIVENPAA: &str = "சுடர்த்தொடீஇ கேளாய் தெருவில்நாம் ஆடும்\nமணற்சிற்றில் காலில் சிதையா அடைச்சிய\nகோதை பரிந்து வரிப்பந்து கொண்டோடி\nநோதக்க செய்யும் சிறுபட்டி மேல்ஓர்நாள்\nஅன்னையும் யானும் இருந்தேமா இல்லிரே\nஉண்ணுநீர் வேட்டேன் எனவந்தாற் கன்னை\nஅடர்பொற் சிரகத்தால் வாக்கிச் சுடரிழாய்\nஉண்ணுநீர் ஊட்டிவா என்றாள் எனயானும்\nதன்னை அறியாது சென்றேன்மற் றென்னை\nவளைமுன்கை பற்றி நலியத் தெருமந்திட்(டு)\nஅன்னாய் இவனொருவன் செய்ததுகாண்’ என்றேனா\nஅன்னை அலறிப் படர்தரத் தன்னையான்\nஉண்ணுநீர் விக்கினான் என்றேனா அன்னையும்\nதன்னைப் புறம்பழித்து நீவமற் றென்னைக்\nகடைக்கணால் கொல்வான்போல் நோக்கி நகைக்கூட்டம்\nசெய்தானக் கள்வன் மகன்";

const EX_NERISAI_ACIRIYAPPAA: &str = "அருள்வீற் றிருந்த திருநிழற் போதி\nமுழுதுணர் முனிவநிற் பரவுதும் தொழுதக\nஒருமனம் எய்தி இருவினைப் பிணிவிட்டு\nமுப்பகை கடந்து நால்வகைப் பொருளுணர்ந்\nதோங்குநீர் உலகிடை யாவரும்\nநீங்கா இன்பமொடு நீடுவாழ் கெனவே";

const EX_INAIKKURAL_ACIRIYAPPAA: &str = "நீரின் தண்மையும் தீயின் வெம்மையும்\nசாரச் சார்ந்து\nதீரத் தீரும்\nசாரல் நாடன் கேண்மை\nசாரச் சாரச் சார்ந்து\nதீரத் தீரத் தீர்பொல் லாதே";

const EX_NILAIMANDILA_ACIRIYAPPAA: &str = "புலவன் தீர்த்தன் புண்ணியன் புராணன்\nஉலக நோன்பி னுயர்ந்தோன் வென்கோ\nகுற்றங் கெடுத்தோய் செற்றஞ் செறுத்தோய்\nமுற்ற வுணர்ந்த முதல்வா வென்கோ\nகாமற் கடந்தோய் ஏம மாயோய்\nதீநெறிக் கடும்பகை கடுந்தோ யென்கோ\nஆயிர வாரத் தாழியந் திருந்தடி\nநாவா யிரமிலேன் ஏத்துவ தெவனோ\n";

const EX_THARAVUKOCHA_KALIPPAA: &str = "செல்வப்போர்க் கதக்கண்ணன் செயிர்த்தெறிந்த சினவாழி\nமுல்லைத்தார் மறமன்னர் முடித்தலையை முருக்கிப்போய்\nஎல்லைநீர் வியன்கொண்மூ இடைநுழையும் மதியம்போல்\nமல்லல்ஒங் கெழில்யானை மருமம்பாய்ந் தொளித்ததே\n";

const EX_VENKALIPPAA: &str = "ஏர்மலர் நறுங்கோதை எருத்தலைப்ப இறைஞ்சித்தன்\nவார்மலர்த் தடங்கண்ணார் வலைப்பட்டு வருந்தியவென்\nதார்வரை அகன்மார்பன் தனிமையை அறியுங்கொல்\nசீர்மலி கொடியிடை சிறந்து\n";

const EX_KURALADI_VANJIPPAA: &str = "மாகத்தினர் மாண்புவியினர்\nயோகத்தினர் உரைமறையினர்\nஞானத்தினர் நயஆகமப்\nபேரறிவினர் பெருநூலினர்\nகாணத்தகு பல்கணத்தினர்\nஎன்றே\nஇன்னன பல்லோர் ஏத்தும் பெருமான்\nமன்னவன் காந்த மலையுறை முருகனே";

const EX_SINTHADI_ACIRIYAPPAA: &str = "கொடிவாலன குருநிறத்தன குறுந்தாளன\nவடிவாலெயிற் றழலுளையன வள்ளுகிரன\nபணையெருத்தின் இணையரிமான் அணையேறித்\nதுணையில்லாத் துறவுநெறிக் கிறைவனாகி\nஎயினடுவண் இனிதிருந் தெல்லோர்க்கும்\nபயில்படுவினை பத்தியலாற் செப்பியோன்\nபுணையெனத்\nதிருவுறு திருந்தடி திசைதொழ\nவெருவுறும் நாற்கதி; வீடுநனி எளிதே";

const EX_KURATTAZHISAI: &str = "நண்ணு வார்வினை நைய நாடொறும் நற்ற வர்க்கர சாய ஞானநல்\nகண்ணி னானடி யேயடை வார்கள் கற்றவரே";

const EX_KURAL_VENSENTHURAI: &str = "போதிநிழற் புனிதன் பொலங்கழல்\nஆதி உலகிற் காண்";

const EX_VENTAZHISAI: &str = "நண்பி தென்று தீய சொல்லார்\nமுன்பு நின்று முனிவு செய்யார்\nஅன்பு வேண்டு பவர்";

const EX_VELLATHAZHISAI: &str = "ஏரினைப் போற்றுதும்! ஏரினைப் போற்றுதும்!\nபாருல கத்தோர் பசிப்பிணிக் கோர்மருந்தாய்\nஆருயி ரோம்புத லான்\n\nகைத்தொழில் போற்றுதும் கைத்தொழில் போற்றுதும்\nஒத்துல கத்தே உயர்வாழ்வுக் கானபொருள்\nஅத்தனையுந் தான்தருத லான்\n\nவாணிகம் போற்றுதும் வாணிகம் போற்றுதும்\nஏணிபோல் எப்பொருளும் எங்கும்இல் லென்னாமே\nஆணிபோ லேதருத லான்";

const EX_VENDURAI: &str = "படர்தருவெவ் வினைத்தொடர்பாற் பவத்தொடர்பப் பவதொடர்பாற் படராநிற்கும்\nவிடலரும்வெவ் வினைத்தொடர்பவ் வினைத்தொடர்புக் கொழிபுண்டோ வினையேற்கம்மா\nவிடர்பெரிது முடையேன்மற் றென்செய்கே னென்செய்கே\nனடலரவ மரைக்கசைத்த வடிகேளோ வடிகேளோ";

const EX_VELIVIRUTHAM: &str = "மருள்அறுத்த பெரும்போதி மாதவரைக் கண்டிலனால்! - என்செய்கோயான்!\nஅருள்இருந்த திருமொழியால் அறவழக்கங் கேட்டிலனால்! - என்செய்கோயான்!\nபொருள்அறியும் அருந்தவத்துப் புரவலரைக் கண்டிலனால்! - என்செய்கோயான்!";

const EX_ACIRIYA_THAZHISAI: &str = "வானுற நிமிர்ந்தனை வையகம் அளந்தனை\nபான்மதி விடுத்தனை பல்லுயிர் ஓம்பினை\nநீனிற வண்ணநின் நிரைகழல் தொழுதனம்";

const EX_ACIRIYA_THURAI: &str = "இரங்கு குயில்முழவா இன்னிசையாழ் தேனா\nஅரங்கு மணிபொழிலா ஆடும் போலும் இளவேனில்\nஅரங்கு மணிபொழிலா ஆடு மாயின்\nமரங்கொல் மணந்தகன்றார் நெஞ்சமென் செய்த திளவேனில்";

const EX_ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "தொழும்அடியர் இதயமலர் ஒருபொழுதும் பிரிவரிய துணைவர் எனலாம்\nஎழும்இரவி கிரணநிகர் இலகுதுகில் புனைசெய்தருள் இறைவர் இடமாம்\nகுழுவுமறை யவருமுனி வரருமரி பிரமருர கவனும் எவரும்\nதொழுகைய இமையவரும் அறம்மருவு துதிசெய்தெழு துடித புரமே!";

// Leading newline matches JS template literal for this id.
const EX_ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "\nதோடார் இலங்கு மலர்கோதி வண்டு வரிபாட நீடு துணர்சேர்\nவாடாத போதி நெறிநீழல் மேய வரதன் பயந்த அறநூல்\nகோடாத சீல விதமேவி வாய்மை குணனாக நாளும் முயல்வார்\nவீடாத இன்ப நெறிசேர்வர்! துன்ப வினைசேர்தல் நாளும் இலரே\n          ";

const EX_ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "எண்டிசையும் ஆகி இருள்அகல நூறி எழுதளிர்கள் சோதி முழுதுலகம் நாறி\nவண்டிசைகள் பாடி மதுமலர்கள் வேய்ந்து மழைமருவு போதி உழைநிழல்கொள் வாமன்\nவெண்டிரையின் மீது விரிகதிர்கள் காண வெறிதழல்கொள் மேனி அறிவனெழில் மேவு\nபுண்டரிக பாதம் நமசரனம் ஆகும் எனமுனிவர் தீமை புணர்பிறவி காணார்";

const EX_KALITHAZHISAI: &str = "வாள்வரி வேங்கை வழங்கும் சிறுநெறிஎம்\nகேள்வரும் போழ்தில் எழால்வாழி வெண்திங்காள்\nகேள்வரும் போழ்தில் எழாலாய்க் குறாலியரோ\nநீள்வரி நாகத் தெயிறே வாழி வெண்திங்காள்";

const EX_KALITHURAI: &str = "ஆவி அந்துகில் புனைவதொன் றன்றிவே றறியாள்\nதூவி அன்னமென் புனலிடைத் தோய்கிலா மெய்யாள்\nதேவு தெண்கடல் அமிழ்துகொண் டனங்கவேள் செய்த\nஓவி யம்புகை யுண்டதே ஒக்கின்ற உருவாள்";

const EX_KATTALAI_KALIPPAA: &str = "அன்னை யெத்தனை யெத்தனை அன்னையோ\nஅப்ப னெத்தனை யெத்தனை அப்பனோ\nபின்னை யெத்தனை யெத்தனை பெண்டிரோ\nபிள்ளை யெத்தனை யெத்தனை பிள்ளையோ\nமுன்னை யெத்தனை யெத்தனை சென்மமோ\nமூட மாயடி யேனும றிந்திலேன்\nஇன்னு மெத்தனை யெத்தனை சென்மமோ\nஎன்செய் வேன்கச்சி யேகம்ப நாதனே";

const EX_KATTALAI_KALITHURAI: &str = "தனந்தரும் கல்வி தருமொரு நாளும் தளர்வறியா\nமனந்தரும் தெய்வ வடிவும் தரும்நெஞ்சில் வஞ்சமில்லா\nஇனந்தரும் நல்லன எல்லாம் தருமன்பர் என்பவர்க்கே\nகனந்தரும் பூங்குழ லாளபி ராமி கடைக்கண்களே";

const EX_KALIVIRUTHAM: &str = "பேணநோற் றதுமனைப் பிறவி பெண்மைபோல்\nநாணநோற் றுயர்ந்தது நங்கை தோன்றலான்\nமாணநோற் றீண்டிவள் இருந்த வாறெலாம்\nகாணநோற் றிலனவன் கமலக் கண்களால்";

const EX_VANJITHAZHISAI: &str = "மடப்பிடியை மதவேழம்\nதடக்கையான் வெயில்மறைக்கும்\nஇடைச்சுரம் இறந்தார்க்கே\nநடக்குமென் மனனேகாண்\n\nபேடையை இரும்போத்துத்\nதோகையான் வெயில்மறைக்கும்\nகாடகம் இறந்தார்க்கே\nஓடுமென் மனனேகாண்\n\nஇரும்பிடியை இகல்வேழம்\nபெருங்கையான் வெயில்மறைக்கும்\nஅருஞ்சுரம் இறந்தார்க்கே\nவிரும்புமென் மனனேகாண்";

const EX_VANJITHURAI: &str = "பொருந்து போதியில்\nஇருந்த மாதவர்\nதிருந்து சேவடி\nமருந்து ஆகுமே";

const EX_VANJIVIRUTHAM: &str = "அணிதங்கு போதி வாமன்\nபணிதங்கு பாதம் அல்லால்\nதுணிபொன் றிலாத தேவர்\nமணிதங்கு பாதம் மேவார்";

// --- Tamil labels (`tamilKeys` in JS) --------------------------------------

const TA_ORU_VIKARPA_KURAL_VENPAA: &str = "ஒரு விகற்ப குறள் வெண்பா";
const TA_IRU_VIKARPA_KURAL_VENPAA: &str = "இரு விகற்ப குறள் வெண்பா";
const TA_NERISAI_SINTHIYAL_VENPAA: &str = "நேரிசை சிந்தியல் வெண்பா";
const TA_INISAI_SINTHIYAL_VENPAA: &str = "இன்னிசை சிந்தியல் வெண்பா";
const TA_ORU_VIKARPA_NERISAI_VENPAA: &str = "ஒரு விகற்ப நேரிசை வெண்பா";
const TA_IRU_VIKARPA_NERISAI_VENPAA: &str = "இரு விகற்ப நேரிசை வெண்பா";
const TA_ORU_VIKARPA_INISAI_VENPAA: &str = "ஒரு விகற்ப இன்னிசை வெண்பா";
const TA_PALA_VIKARPA_INISAI_VENPAA: &str = "பல விகற்ப இன்னிசை வெண்பா";
const TA_PAQRODAI_VENPAA: &str = "பஃறொடை வெண்பா";
const TA_KALIVENPAA: &str = "கலிவெண்பா";
const TA_NERISAI_ACIRIYAPPAA: &str = "நேரிசை ஆசிரியப்பா";
const TA_INAIKKURAL_ACIRIYAPPAA: &str = "இணைக்குறள் ஆசிரியப்பா";
const TA_NILAIMANDILA_ACIRIYAPPAA: &str = "நிலைமண்டில ஆசிரியப்பா";
const TA_THARAVUKOCHA_KALIPPAA: &str = "தரவுகொச்சகக் கலிப்பா";
const TA_VENKALIPPAA: &str = "வெண்கலிப்பா";
const TA_KURALADI_VANJIPPAA: &str = "குறளடி வஞ்சிப்பா";
const TA_SINTHADI_ACIRIYAPPAA: &str = "சிந்தடி வஞ்சிப்பா";
const TA_KURATTAZHISAI: &str = "குறட்டாழிசை";
const TA_KURAL_VENSENTHURAI: &str = "குறள் வெண்செந்துறை";
const TA_VENTAZHISAI: &str = "வெண்டாழிசை";
const TA_VELLATHAZHISAI: &str = "வெள்ளொத்தாழிசை";
const TA_VENDURAI: &str = "வெண்டுறை";
const TA_VELIVIRUTHAM: &str = "வெளிவிருத்தம்";
const TA_ACIRIYA_THAZHISAI: &str = "ஆசிரியத் தாழிசை";
const TA_ACIRIYA_THURAI: &str = "ஆசிரியத் துறை";
const TA_ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "அறுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்";
const TA_ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "எழுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்";
const TA_ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM: &str = "எண்சீர் கழிநெடிலடி ஆசிரிய விருத்தம்";
const TA_KALITHAZHISAI: &str = "கலித்தாழிசை";
const TA_KALITHURAI: &str = "கலித்துறை";
const TA_KATTALAI_KALIPPAA: &str = "கட்டளை கலிப்பா";
const TA_KATTALAI_KALITHURAI: &str = "கட்டளை கலித்துறை";
const TA_KALIVIRUTHAM: &str = "கலிவிருத்தம்";
const TA_VANJITHAZHISAI: &str = "வஞ்சித்தாழிசை";
const TA_VANJITHURAI: &str = "வஞ்சித்துறை";
const TA_VANJIVIRUTHAM: &str = "வஞ்சி விருத்தம்";

/// Example text for a sample id, or `None` if `sample_id` is unknown.
pub fn poem_variation_example(sample_id: &str) -> Option<&'static str> {
    Some(match sample_id {
        ORU_VIKARPA_KURAL_VENPAA => EX_ORU_VIKARPA_KURAL_VENPAA,
        IRU_VIKARPA_KURAL_VENPAA => EX_IRU_VIKARPA_KURAL_VENPAA,
        NERISAI_SINTHIYAL_VENPAA => EX_NERISAI_SINTHIYAL_VENPAA,
        INISAI_SINTHIYAL_VENPAA => EX_INISAI_SINTHIYAL_VENPAA,
        ORU_VIKARPA_NERISAI_VENPAA => EX_ORU_VIKARPA_NERISAI_VENPAA,
        IRU_VIKARPA_NERISAI_VENPAA => EX_IRU_VIKARPA_NERISAI_VENPAA,
        ORU_VIKARPA_INISAI_VENPAA => EX_ORU_VIKARPA_INISAI_VENPAA,
        PALA_VIKARPA_INISAI_VENPAA => EX_PALA_VIKARPA_INISAI_VENPAA,
        PAQRODAI_VENPAA => EX_PAQRODAI_VENPAA,
        KALIVENPAA => EX_KALIVENPAA,
        NERISAI_ACIRIYAPPAA => EX_NERISAI_ACIRIYAPPAA,
        INAIKKURAL_ACIRIYAPPAA => EX_INAIKKURAL_ACIRIYAPPAA,
        NILAIMANDILA_ACIRIYAPPAA => EX_NILAIMANDILA_ACIRIYAPPAA,
        THARAVUKOCHA_KALIPPAA => EX_THARAVUKOCHA_KALIPPAA,
        VENKALIPPAA => EX_VENKALIPPAA,
        KURALADI_VANJIPPAA => EX_KURALADI_VANJIPPAA,
        SINTHADI_ACIRIYAPPAA => EX_SINTHADI_ACIRIYAPPAA,
        KURATTAZHISAI => EX_KURATTAZHISAI,
        KURAL_VENSENTHURAI => EX_KURAL_VENSENTHURAI,
        VENTAZHISAI => EX_VENTAZHISAI,
        VELLATHAZHISAI => EX_VELLATHAZHISAI,
        VENDURAI => EX_VENDURAI,
        VELIVIRUTHAM => EX_VELIVIRUTHAM,
        ACIRIYA_THAZHISAI => EX_ACIRIYA_THAZHISAI,
        ACIRIYA_THURAI => EX_ACIRIYA_THURAI,
        ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM => EX_ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM => EX_ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM => EX_ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        KALITHAZHISAI => EX_KALITHAZHISAI,
        KALITHURAI => EX_KALITHURAI,
        KATTALAI_KALIPPAA => EX_KATTALAI_KALIPPAA,
        KATTALAI_KALITHURAI => EX_KATTALAI_KALITHURAI,
        KALIVIRUTHAM => EX_KALIVIRUTHAM,
        VANJITHAZHISAI => EX_VANJITHAZHISAI,
        VANJITHURAI => EX_VANJITHURAI,
        VANJIVIRUTHAM => EX_VANJIVIRUTHAM,
        _ => return None,
    })
}

/// Tamil display label for a sample id (`tamilKeys` in JS).
pub fn tamil_label_for_sample(sample_id: &str) -> Option<&'static str> {
    Some(match sample_id {
        ORU_VIKARPA_KURAL_VENPAA => TA_ORU_VIKARPA_KURAL_VENPAA,
        IRU_VIKARPA_KURAL_VENPAA => TA_IRU_VIKARPA_KURAL_VENPAA,
        NERISAI_SINTHIYAL_VENPAA => TA_NERISAI_SINTHIYAL_VENPAA,
        INISAI_SINTHIYAL_VENPAA => TA_INISAI_SINTHIYAL_VENPAA,
        ORU_VIKARPA_NERISAI_VENPAA => TA_ORU_VIKARPA_NERISAI_VENPAA,
        IRU_VIKARPA_NERISAI_VENPAA => TA_IRU_VIKARPA_NERISAI_VENPAA,
        ORU_VIKARPA_INISAI_VENPAA => TA_ORU_VIKARPA_INISAI_VENPAA,
        PALA_VIKARPA_INISAI_VENPAA => TA_PALA_VIKARPA_INISAI_VENPAA,
        PAQRODAI_VENPAA => TA_PAQRODAI_VENPAA,
        KALIVENPAA => TA_KALIVENPAA,
        NERISAI_ACIRIYAPPAA => TA_NERISAI_ACIRIYAPPAA,
        INAIKKURAL_ACIRIYAPPAA => TA_INAIKKURAL_ACIRIYAPPAA,
        NILAIMANDILA_ACIRIYAPPAA => TA_NILAIMANDILA_ACIRIYAPPAA,
        THARAVUKOCHA_KALIPPAA => TA_THARAVUKOCHA_KALIPPAA,
        VENKALIPPAA => TA_VENKALIPPAA,
        KURALADI_VANJIPPAA => TA_KURALADI_VANJIPPAA,
        SINTHADI_ACIRIYAPPAA => TA_SINTHADI_ACIRIYAPPAA,
        KURATTAZHISAI => TA_KURATTAZHISAI,
        KURAL_VENSENTHURAI => TA_KURAL_VENSENTHURAI,
        VENTAZHISAI => TA_VENTAZHISAI,
        VELLATHAZHISAI => TA_VELLATHAZHISAI,
        VENDURAI => TA_VENDURAI,
        VELIVIRUTHAM => TA_VELIVIRUTHAM,
        ACIRIYA_THAZHISAI => TA_ACIRIYA_THAZHISAI,
        ACIRIYA_THURAI => TA_ACIRIYA_THURAI,
        ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM => TA_ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM => TA_ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM => TA_ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        KALITHAZHISAI => TA_KALITHAZHISAI,
        KALITHURAI => TA_KALITHURAI,
        KATTALAI_KALIPPAA => TA_KATTALAI_KALIPPAA,
        KATTALAI_KALITHURAI => TA_KATTALAI_KALITHURAI,
        KALIVIRUTHAM => TA_KALIVIRUTHAM,
        VANJITHAZHISAI => TA_VANJITHAZHISAI,
        VANJITHURAI => TA_VANJITHURAI,
        VANJIVIRUTHAM => TA_VANJIVIRUTHAM,
        _ => return None,
    })
}

/// Build a row like JS `variationRow(key)`. `sample_id` must be a `'static` machine id
/// (same literals as in [`data/poem_variations.js`](../../data/poem_variations.js)).
pub fn variation_row(sample_id: &'static str) -> Option<PoemVariationRow> {
    let example = poem_variation_example(sample_id)?;
    let ta = tamil_label_for_sample(sample_id)?;
    Some(PoemVariationRow {
        en: sample_id,
        ta,
        example,
    })
}

static VENPAA_SPECIAL_TYPES: &[PoemVariationRow] = &[
    PoemVariationRow {
        en: ORU_VIKARPA_KURAL_VENPAA,
        ta: TA_ORU_VIKARPA_KURAL_VENPAA,
        example: EX_ORU_VIKARPA_KURAL_VENPAA,
    },
    PoemVariationRow {
        en: IRU_VIKARPA_KURAL_VENPAA,
        ta: TA_IRU_VIKARPA_KURAL_VENPAA,
        example: EX_IRU_VIKARPA_KURAL_VENPAA,
    },
    PoemVariationRow {
        en: NERISAI_SINTHIYAL_VENPAA,
        ta: TA_NERISAI_SINTHIYAL_VENPAA,
        example: EX_NERISAI_SINTHIYAL_VENPAA,
    },
    PoemVariationRow {
        en: INISAI_SINTHIYAL_VENPAA,
        ta: TA_INISAI_SINTHIYAL_VENPAA,
        example: EX_INISAI_SINTHIYAL_VENPAA,
    },
    PoemVariationRow {
        en: ORU_VIKARPA_NERISAI_VENPAA,
        ta: TA_ORU_VIKARPA_NERISAI_VENPAA,
        example: EX_ORU_VIKARPA_NERISAI_VENPAA,
    },
    PoemVariationRow {
        en: IRU_VIKARPA_NERISAI_VENPAA,
        ta: TA_IRU_VIKARPA_NERISAI_VENPAA,
        example: EX_IRU_VIKARPA_NERISAI_VENPAA,
    },
    PoemVariationRow {
        en: ORU_VIKARPA_INISAI_VENPAA,
        ta: TA_ORU_VIKARPA_INISAI_VENPAA,
        example: EX_ORU_VIKARPA_INISAI_VENPAA,
    },
    PoemVariationRow {
        en: PALA_VIKARPA_INISAI_VENPAA,
        ta: TA_PALA_VIKARPA_INISAI_VENPAA,
        example: EX_PALA_VIKARPA_INISAI_VENPAA,
    },
    PoemVariationRow {
        en: PAQRODAI_VENPAA,
        ta: TA_PAQRODAI_VENPAA,
        example: EX_PAQRODAI_VENPAA,
    },
    PoemVariationRow {
        en: KALIVENPAA,
        ta: TA_KALIVENPAA,
        example: EX_KALIVENPAA,
    },
];

static VENPAA_VARIATIONS: &[PoemVariationRow] = &[
    PoemVariationRow {
        en: KURATTAZHISAI,
        ta: TA_KURATTAZHISAI,
        example: EX_KURATTAZHISAI,
    },
    PoemVariationRow {
        en: KURAL_VENSENTHURAI,
        ta: TA_KURAL_VENSENTHURAI,
        example: EX_KURAL_VENSENTHURAI,
    },
    PoemVariationRow {
        en: VENTAZHISAI,
        ta: TA_VENTAZHISAI,
        example: EX_VENTAZHISAI,
    },
    PoemVariationRow {
        en: VELLATHAZHISAI,
        ta: TA_VELLATHAZHISAI,
        example: EX_VELLATHAZHISAI,
    },
    PoemVariationRow {
        en: VENDURAI,
        ta: TA_VENDURAI,
        example: EX_VENDURAI,
    },
    PoemVariationRow {
        en: VELIVIRUTHAM,
        ta: TA_VELIVIRUTHAM,
        example: EX_VELIVIRUTHAM,
    },
];

static ACIRIYAPPA_SPECIAL_TYPES: &[PoemVariationRow] = &[
    PoemVariationRow {
        en: NERISAI_ACIRIYAPPAA,
        ta: TA_NERISAI_ACIRIYAPPAA,
        example: EX_NERISAI_ACIRIYAPPAA,
    },
    PoemVariationRow {
        en: INAIKKURAL_ACIRIYAPPAA,
        ta: TA_INAIKKURAL_ACIRIYAPPAA,
        example: EX_INAIKKURAL_ACIRIYAPPAA,
    },
    PoemVariationRow {
        en: NILAIMANDILA_ACIRIYAPPAA,
        ta: TA_NILAIMANDILA_ACIRIYAPPAA,
        example: EX_NILAIMANDILA_ACIRIYAPPAA,
    },
];

static ACIRIYAPPA_VARIATIONS: &[PoemVariationRow] = &[
    PoemVariationRow {
        en: ACIRIYA_THAZHISAI,
        ta: TA_ACIRIYA_THAZHISAI,
        example: EX_ACIRIYA_THAZHISAI,
    },
    PoemVariationRow {
        en: ACIRIYA_THURAI,
        ta: TA_ACIRIYA_THURAI,
        example: EX_ACIRIYA_THURAI,
    },
    PoemVariationRow {
        en: ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        ta: TA_ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        example: EX_ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
    },
    PoemVariationRow {
        en: ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        ta: TA_ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        example: EX_ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
    },
    PoemVariationRow {
        en: ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        ta: TA_ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
        example: EX_ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
    },
];

static KALIPPAA_SPECIAL_TYPES: &[PoemVariationRow] = &[
    PoemVariationRow {
        en: THARAVUKOCHA_KALIPPAA,
        ta: TA_THARAVUKOCHA_KALIPPAA,
        example: EX_THARAVUKOCHA_KALIPPAA,
    },
    PoemVariationRow {
        en: VENKALIPPAA,
        ta: TA_VENKALIPPAA,
        example: EX_VENKALIPPAA,
    },
];

static KALIPPAA_VARIATIONS: &[PoemVariationRow] = &[
    PoemVariationRow {
        en: KALITHAZHISAI,
        ta: TA_KALITHAZHISAI,
        example: EX_KALITHAZHISAI,
    },
    PoemVariationRow {
        en: KALITHURAI,
        ta: TA_KALITHURAI,
        example: EX_KALITHURAI,
    },
    PoemVariationRow {
        en: KATTALAI_KALIPPAA,
        ta: TA_KATTALAI_KALIPPAA,
        example: EX_KATTALAI_KALIPPAA,
    },
    PoemVariationRow {
        en: KATTALAI_KALITHURAI,
        ta: TA_KATTALAI_KALITHURAI,
        example: EX_KATTALAI_KALITHURAI,
    },
    PoemVariationRow {
        en: KALIVIRUTHAM,
        ta: TA_KALIVIRUTHAM,
        example: EX_KALIVIRUTHAM,
    },
];

static VANJIPPAA_SPECIAL_TYPES: &[PoemVariationRow] = &[
    PoemVariationRow {
        en: KURALADI_VANJIPPAA,
        ta: TA_KURALADI_VANJIPPAA,
        example: EX_KURALADI_VANJIPPAA,
    },
    PoemVariationRow {
        en: SINTHADI_ACIRIYAPPAA,
        ta: TA_SINTHADI_ACIRIYAPPAA,
        example: EX_SINTHADI_ACIRIYAPPAA,
    },
];

static VANJIPPAA_VARIATIONS: &[PoemVariationRow] = &[
    PoemVariationRow {
        en: VANJITHAZHISAI,
        ta: TA_VANJITHAZHISAI,
        example: EX_VANJITHAZHISAI,
    },
    PoemVariationRow {
        en: VANJITHURAI,
        ta: TA_VANJITHURAI,
        example: EX_VANJITHURAI,
    },
    PoemVariationRow {
        en: VANJIVIRUTHAM,
        ta: TA_VANJIVIRUTHAM,
        example: EX_VANJIVIRUTHAM,
    },
];

/// All four metre blocks in stable order: Venpaa, Asiriyappa, Kalippaa, Vanjippaa.
pub fn poem_variations_blocks() -> [PoemVariationsBlock; 4] {
    [
        PoemVariationsBlock {
            metre_key: VENPAA,
            special_types: VENPAA_SPECIAL_TYPES,
            variations: VENPAA_VARIATIONS,
        },
        PoemVariationsBlock {
            metre_key: ACIRIYAPPA,
            special_types: ACIRIYAPPA_SPECIAL_TYPES,
            variations: ACIRIYAPPA_VARIATIONS,
        },
        PoemVariationsBlock {
            metre_key: KALIPPAA,
            special_types: KALIPPAA_SPECIAL_TYPES,
            variations: KALIPPAA_VARIATIONS,
        },
        PoemVariationsBlock {
            metre_key: VANJIPPAA,
            special_types: VANJIPPAA_SPECIAL_TYPES,
            variations: VANJIPPAA_VARIATIONS,
        },
    ]
}

/// Look up `special_types` and `variations` slices for a metre key.
pub fn poem_variations_for_metre(metre_key: &str) -> Option<(&'static [PoemVariationRow], &'static [PoemVariationRow])> {
    match metre_key {
        VENPAA => Some((VENPAA_SPECIAL_TYPES, VENPAA_VARIATIONS)),
        ACIRIYAPPA => Some((ACIRIYAPPA_SPECIAL_TYPES, ACIRIYAPPA_VARIATIONS)),
        KALIPPAA => Some((KALIPPAA_SPECIAL_TYPES, KALIPPAA_VARIATIONS)),
        VANJIPPAA => Some((VANJIPPAA_SPECIAL_TYPES, VANJIPPAA_VARIATIONS)),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_sample_id_has_example_and_tamil_label() {
        let ids = [
            ORU_VIKARPA_KURAL_VENPAA,
            IRU_VIKARPA_KURAL_VENPAA,
            NERISAI_SINTHIYAL_VENPAA,
            INISAI_SINTHIYAL_VENPAA,
            ORU_VIKARPA_NERISAI_VENPAA,
            IRU_VIKARPA_NERISAI_VENPAA,
            ORU_VIKARPA_INISAI_VENPAA,
            PALA_VIKARPA_INISAI_VENPAA,
            PAQRODAI_VENPAA,
            KALIVENPAA,
            NERISAI_ACIRIYAPPAA,
            INAIKKURAL_ACIRIYAPPAA,
            NILAIMANDILA_ACIRIYAPPAA,
            THARAVUKOCHA_KALIPPAA,
            VENKALIPPAA,
            KURALADI_VANJIPPAA,
            SINTHADI_ACIRIYAPPAA,
            KURATTAZHISAI,
            KURAL_VENSENTHURAI,
            VENTAZHISAI,
            VELLATHAZHISAI,
            VENDURAI,
            VELIVIRUTHAM,
            ACIRIYA_THAZHISAI,
            ACIRIYA_THURAI,
            ARUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
            ELUCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
            ENCIR_KAZHINEDILADI_ACIRIYA_VIRUTHAM,
            KALITHAZHISAI,
            KALITHURAI,
            KATTALAI_KALIPPAA,
            KATTALAI_KALITHURAI,
            KALIVIRUTHAM,
            VANJITHAZHISAI,
            VANJITHURAI,
            VANJIVIRUTHAM,
        ];
        for id in ids {
            assert!(
                poem_variation_example(id).is_some(),
                "missing example for {id}"
            );
            assert!(
                tamil_label_for_sample(id).is_some(),
                "missing Tamil label for {id}"
            );
            let r = variation_row(id).expect("variation_row");
            assert_eq!(r.en, id);
            assert!(!r.example.is_empty());
            assert!(!r.ta.is_empty());
        }
    }

    #[test]
    fn blocks_match_expected_counts() {
        let b = poem_variations_blocks();
        assert_eq!(b[0].metre_key, VENPAA);
        assert_eq!(b[0].special_types.len(), 10);
        assert_eq!(b[0].variations.len(), 6);
        assert_eq!(b[1].special_types.len(), 3);
        assert_eq!(b[1].variations.len(), 5);
        assert_eq!(b[2].special_types.len(), 2);
        assert_eq!(b[2].variations.len(), 5);
        assert_eq!(b[3].special_types.len(), 2);
        assert_eq!(b[3].variations.len(), 3);
    }
}
