import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { AboutSectionNav } from '#/components/about/AboutSectionNav'

type HistoryLang = 'en' | 'ta'

type HistoryBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string; byline?: string }
  | { type: 'table'; headers: [string, string, string]; rows: [string, string, string][] }

type HistorySection = {
  id: string
  title: string
  blocks: HistoryBlock[]
}

type KeywordLink = {
  term: string
  className: string
  href?: string
}

const GROKIPEDIA_BASE = 'https://grokipedia.com'

const KEYWORD_LINKS: KeywordLink[] = [
  { term: 'Tamil Prosody', className: 'text-cyan-300', href: 'https://grokipedia.com/page/Tamil_Prosody' },
  { term: 'Tamil Yappu', className: 'text-cyan-300', href: 'https://grokipedia.com/page/Tamil_prosody' },
  { term: 'Yappu', className: 'text-cyan-300' },
  { term: 'தமிழ் யாப்பு', className: 'text-cyan-300' },
  { term: 'Chandas', className: 'text-violet-300' },
  { term: 'சந்தஸ்', className: 'text-violet-300' },
  { term: 'acai', className: 'text-emerald-300' },
  { term: 'அசை', className: 'text-emerald-300' },
  { term: 'Tamil prosody', className: 'text-cyan-200' },
  { term: 'தமிழ் இலக்கணம்', className: 'text-cyan-200' },
  {
    term: 'Sanskrit prosody',
    className: 'text-violet-200',
    href: 'https://grokipedia.com/page/Sanskrit_prosody',
  },
  { term: 'Greek Prosody', className: 'text-orange-300', href: 'https://grokipedia.com/page/Greek_prosody' },
  { term: 'Greek prosody', className: 'text-orange-300', href: 'https://grokipedia.com/page/Greek_prosody' },
  { term: 'Latin Ars Metre', className: 'text-orange-300', href: 'https://grokipedia.com/page/Latin_prosody' },
  { term: 'Latin Prosody', className: 'text-orange-300', href: 'https://grokipedia.com/page/Latin_prosody' },
  { term: 'Latin prosody', className: 'text-orange-300', href: 'https://grokipedia.com/page/Latin_prosody' },
  { term: 'paeon prosody', className: 'text-lime-300', href: 'https://grokipedia.com/page/paeon_prosody' },
  { term: 'சமஸ்கிருதம்', className: 'text-violet-200' },
  { term: 'Sanskrit', className: 'text-violet-300' },
  { term: 'Tamil language', className: 'text-cyan-300', href: 'https://grokipedia.com/page/Tamil_language' },
  { term: 'Tamil', className: 'text-cyan-300', href: 'https://grokipedia.com/page/Tamil_language' },
  { term: 'மாத்திரை', className: 'text-emerald-200' },
  { term: 'mātrā', className: 'text-emerald-200' },
  { term: 'gaṇa', className: 'text-emerald-200' },
  { term: 'metreme', className: 'text-emerald-200' },
  { term: 'retroflex sounds', className: 'text-teal-300', href: 'https://grokipedia.com/page/Retroflex_consonant' },
  {
    term: 'Dravidian languages',
    className: 'text-teal-300',
    href: 'https://grokipedia.com/page/Dravidian_languages',
  },
  { term: 'திராவிட மொழிகளும்', className: 'text-teal-300', href: 'https://grokipedia.com/page/Dravidian_languages' },
  { term: '(திராவிட) மொழிகளும்', className: 'text-teal-300', href: 'https://grokipedia.com/page/Dravidian_languages' },
  { term: 'Dravidian', className: 'text-teal-300', href: 'https://grokipedia.com/page/Dravidian_languages' },
  { term: 'திராவிட', className: 'text-teal-300', href: 'https://grokipedia.com/page/Dravidian_languages' },
  { term: 'Vīracōḻiyam', className: 'text-amber-300' },
  { term: 'வீரசோழியம்', className: 'text-amber-300' },
  { term: 'Peruntēvaṉār', className: 'text-amber-200' },
  { term: 'பெருந்தேவனார்', className: 'text-amber-200' },
  { term: 'Kā. Ra. Kōvintarāja Mutaliyār', className: 'text-amber-200' },
  { term: 'கா. ரா. கோவிந்தராச முதலியார்', className: 'text-amber-200' },
  { term: 'bhakti', className: 'text-rose-300' },
  { term: 'பக்தி', className: 'text-rose-300' },
  { term: 'Agastya', className: 'text-sky-300' },
  { term: 'அகத்தியர்', className: 'text-sky-300' },
  { term: 'Manipravalam', className: 'text-fuchsia-300' },
  { term: 'மணிப்பிரவாளம்', className: 'text-fuchsia-300' },
  { term: 'Latin', className: 'text-orange-300' },
  { term: 'லத்தீன்', className: 'text-orange-300' },
  { term: 'Greek', className: 'text-orange-300' },
  { term: 'கிரேக்க', className: 'text-orange-300' },
  { term: 'Indo-Aryan', className: 'text-teal-200' },
  { term: 'mayūra', className: 'text-lime-300' },
  { term: 'kaṭa', className: 'text-lime-300' },
  { term: 'toṭai', className: 'text-pink-300' },
  { term: 'எதுகை', className: 'text-pink-300' },
  { term: 'மோனை', className: 'text-pink-300' },
]

const historySections: Record<HistoryLang, HistorySection[]> = {
  en: [
    {
      id: 'mutual-influence',
      title: 'Tamil Yappu and Sanskrit Chandas: Mutual Influence Over Time',
      blocks: [
        {
          type: 'paragraph',
          text: 'Tamil prosody, traditionally called **Yappu**, developed as a distinct system based on the *acai* (metreme) unit. This system is different from Sanskrit prosody (*Chandas*), which is based on syllable groups (*gaṇa*) and mora (*mātrā*).',
        },
        {
          type: 'paragraph',
          text: 'Over many centuries of close contact - especially from the 6th-7th century CE onward - the two traditions influenced each other:',
        },
        {
          type: 'paragraph',
          text: 'Sanskrit Influence on Tamil Yappu',
        },
        {
          type: 'list',
          items: [
            'From around the 7th century, Tamil poets and grammarians began adopting certain features from Sanskrit Chandas, such as fixed syllable counts per line and mora-based counting.',
            'New metres like **viruttam** emerged, clearly inspired by the Sanskrit term *vṛtta*.',
            'Works such as **Vīracōḻiyam** (11th century) show a conscious blending of Tamil and Sanskrit grammatical frameworks. The most widely used modern edition is the one edited by **Kā. Ra. Kōvintarāja Mutaliyār** (Pavāṉantar Kaḻakam, 1942/1970 reprint), which includes the full text along with **Peruntēvaṉār’s commentary**.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Tamil Influence on Sanskrit',
        },
        {
          type: 'paragraph',
          text: 'At the same time, Dravidian languages (including Tamil) left their mark on Sanskrit, particularly in South India:',
        },
        {
          type: 'list',
          items: [
            'Phonology: Sanskrit developed a richer set of retroflex sounds (ṭ, ḍ, ṇ, ṣ, ḷ) partly due to long-term contact with Dravidian languages. This is one of the most widely accepted examples of Dravidian influence on Indo-Aryan.',
            'Vocabulary: Several words in Sanskrit are believed to have Dravidian origins (e.g., mayūra for peacock, kaṭa for mat).',
            'Literature: The strong **bhakti** movement that flourished first in Tamil later influenced Sanskrit literature across India.',
          ],
        },
        {
          type: 'paragraph',
          text: 'This mutual exchange is a natural result of centuries of cultural and linguistic contact in South India.',
        },
        {
          type: 'quote',
          text: 'This exchange is not a loss of identity, but a record of two classical traditions thinking together across centuries.',
        },
      ],
    },
    {
      id: 'comparison',
      title:
        'Tamil Yappu Compared to Latin Prosody (Prosōdia (or ars metrica / metrica)) and Greek Prosody (Προσῳδία (prosōidía))',
      blocks: [
        {
          type: 'paragraph',
          text: 'Latin Prosody (Prosōdia (or ars metrica / metrica)) and Greek Prosody (Προσῳδία (prosōidía)) are both quantitative systems - they organize poetry based on long and short syllables. Latin poets largely adopted and adapted Greek metres.',
        },
        {
          type: 'paragraph',
          text: 'Comparison with Tamil Yappu',
        },
        {
          type: 'table',
          headers: ['Aspect', 'Tamil Yappu', 'Latin & Greek Prosody'],
          rows: [
            ['Basic Unit', 'Acai (metreme)', 'Syllable length (long/short)'],
            ['Main Feature', 'Strong use of toṭai (alliteration)', 'Metrical feet (dactyl, iamb, etc.)'],
            ['Connection to Music', 'Moderate', 'Very strong (especially in Greek)'],
            [
              'Development',
              'Largely independent with later Sanskrit influence',
              'Strong mutual influence between Greek and Latin',
            ],
          ],
        },
        {
          type: 'paragraph',
          text: 'While all three traditions are highly sophisticated, Tamil Yappu developed along different lines, shaped by the structure of the Tamil language and its own literary needs.',
        },
      ],
    },
    {
      id: 'historical-context',
      title: 'Historical Context and Folklore',
      blocks: [
        {
          type: 'paragraph',
          text: 'Language contact between Tamil and Sanskrit was deep and long-lasting. This is reflected not only in grammar books but also in folklore and tradition:',
        },
        {
          type: 'list',
          items: [
            'Many stories describe the sage Agastya as the one who brought Tamil grammar and culture to the South, symbolizing the meeting of northern (Sanskrit) and southern (Tamil) traditions.',
            'In medieval South India, scholars often wrote in both languages, creating mixed styles like Manipravalam.',
            'This kind of mutual influence is common in history whenever two strong literary cultures live side by side for centuries (similar to how English was influenced by French, or how Hindi and Urdu developed together).',
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'paragraph',
          text: 'Tamil grammar and prosody (Yappu) represent a distinct tradition that developed its own internal logic. Over time, it both received influence from Sanskrit and contributed to it - especially in sound system and vocabulary.',
        },
        {
          type: 'paragraph',
          text: 'Compared to Latin and Greek prosody, Tamil Yappu followed a different path, shaped by its own linguistic roots. These differences are not about superiority, but about how different language families naturally develop different ways of creating rhythm and beauty in poetry.',
        },
        {
          type: 'paragraph',
          text: 'Such exchanges between Tamil and Sanskrit are a beautiful example of how languages grow together through contact, scholarship, and shared cultural life over many centuries.',
        },
      ],
    },
    {
      id: 'further-reading',
      title: 'Further Reading',
      blocks: [
        {
          type: 'list',
          items: ['Tamil Prosody', 'Sanskrit prosody', 'Greek Prosody', 'Latin Ars Metre', 'paeon prosody'],
        },
      ],
    },
  ],
  ta: [
    {
      id: 'mutual-influence',
      title: 'தமிழ் யாப்பு மற்றும் சமஸ்கிருத சந்தஸ்: இரு திசை செல்வாக்கு',
      blocks: [
        {
          type: 'paragraph',
          text: 'தமிழ் யாப்பு (**யாப்பு** அல்லது **யாப்பிலக்கணம்**) தனித்துவமான அசை அமைப்பை அடிப்படையாகக் கொண்டு வளர்ந்தது. இது சமஸ்கிருத சந்தஸ் (*அக்ஷரம் + கணம்* அடிப்படை) முறையிலிருந்து வேறுபட்டது.',
        },
        {
          type: 'paragraph',
          text: 'பல நூற்றாண்டுகளாக தமிழும் சமஸ்கிருதமும் ஒன்றோடொன்று நெருக்கமாக இருந்ததால், இரண்டும் ஒன்றையொன்று பாதித்தன.',
        },
        {
          type: 'paragraph',
          text: 'சமஸ்கிருதத்தின் தமிழ் யாப்பில் செல்வாக்கு',
        },
        {
          type: 'list',
          items: [
            'கி.பி. 7ஆம் நூற்றாண்டு முதல், சமஸ்கிருத சந்தஸின் சில அம்சங்கள் தமிழ் யாப்பில் இடம் பெறத் தொடங்கின.',
            'வரிக்கு நிலையான எழுத்து எண்ணிக்கை, மாத்திரை அடிப்படை போன்றவை ஏற்றுக்கொள்ளப்பட்டன.',
            '**விருத்தம்** போன்ற புதிய மெட்ரிகள் உருவாகின (சமஸ்கிருத *விருத்த* இலிருந்து).',
            '11ஆம் நூற்றாண்டில் எழுதப்பட்ட **வீரசோழியம்** போன்ற நூல்கள் தமிழ் மற்றும் சமஸ்கிருத முறைகளை இணைத்து எழுதப்பட்டன. இதன் மிகவும் பயன்படுத்தப்படும் நவீன பதிப்பு **கா. ரா. கோவிந்தராச முதலியார்** (பவாணந்தர் கழகம், 1942/1970 மறுபதிப்பு) ஆகும். இதில் முழு 184 வசனங்களும் **பெருந்தேவனார் உரையுடன்** உள்ளன.',
          ],
        },
        {
          type: 'paragraph',
          text: 'தமிழின் சமஸ்கிருதத்தில் செல்வாக்கு',
        },
        {
          type: 'paragraph',
          text: 'அதே நேரத்தில், தமிழ் (திராவிட) மொழிகளும் சமஸ்கிருதத்தைப் பாதித்தன:',
        },
        {
          type: 'list',
          items: [
            'ஒலி அமைப்பு: சமஸ்கிருதத்தில் பின்வாங்கும் எழுத்துக்கள் (ṭ, ḍ, ṇ, ṣ, ḷ) அதிகரித்தது, திராவிட மொழிகளின் செல்வாக்கால்.',
            'சொற்கள்: சில சமஸ்கிருத சொற்கள் தமிழ் வேர்களில் இருந்து வந்தவை என்று கருதப்படுகின்றன (எ.கா. mayūra = மயில், kaṭa = பாய்).',
            'இலக்கியம்: தமிழில் முதலில் வலுவாக வளர்ந்த பக்தி இயக்கம், பின்னர் சமஸ்கிருத இலக்கியத்தையும் பாதித்தது.',
          ],
        },
        {
          type: 'paragraph',
          text: 'இந்த இரு திசை செல்வாக்கு, இரண்டு வலுவான இலக்கிய மரபுகள் நீண்ட காலம் ஒன்றாக வாழ்ந்ததன் இயற்கையான விளைவு.',
        },
        {
          type: 'quote',
          text: 'இரு மரபுகளின் தொடர்பு என்பது கலப்பல்ல; அது பரஸ்பர அறிவின் தொடர்ச்சி.',
        },
      ],
    },
    {
      id: 'comparison',
      title: 'தமிழ் யாப்பு vs லத்தீன் மற்றும் கிரேக்க Prosody',
      blocks: [
        {
          type: 'paragraph',
          text: 'லத்தீன் மற்றும் கிரேக்க Prosody இரண்டும் அளவு அடிப்படையிலானவை - நீண்ட மற்றும் குறுகிய எழுத்துக்களை அடிப்படையாகக் கொண்டவை. லத்தீன் கிரேக்க மரபைப் பெரிதும் பின்பற்றியது.',
        },
        {
          type: 'paragraph',
          text: 'தமிழ் யாப்புடன் ஒப்பீடு',
        },
        {
          type: 'table',
          headers: ['அம்சம்', 'தமிழ் யாப்பு', 'லத்தீன் & கிரேக்க Prosody'],
          rows: [
            ['அடிப்படை அலகு', 'அசை (metreme)', 'எழுத்து நீளம் (நீண்ட/குறுகிய)'],
            ['முக்கிய அம்சம்', 'தொடை (எதுகை, மோனை)', 'அடி வகைகள் (dactyl, iamb போன்றவை)'],
            ['இசையுடன் தொடர்பு', 'மிதமான', 'மிக வலுவான (குறிப்பாக கிரேக்கத்தில்)'],
            [
              'வளர்ச்சி முறை',
              'தனித்துவமாக வளர்ந்தது + பிற்கால சமஸ்கிருத செல்வாக்கு',
              'கிரேக்க-லத்தீன் இடையே வலுவான பரிமாற்றம்',
            ],
          ],
        },
        {
          type: 'paragraph',
          text: 'இந்த மரபுகள் அனைத்தும் மிகவும் நுட்பமானவை. ஆனால் தமிழ் யாப்பு, தமிழ் மொழியின் அமைப்பு மற்றும் தேவைகளுக்கு ஏற்ப வேறு வழியில் வளர்ந்தது.',
        },
      ],
    },
    {
      id: 'historical-context',
      title: 'வரலாற்று பின்னணி மற்றும் நாட்டுப்புறக் கதைகள்',
      blocks: [
        {
          type: 'paragraph',
          text: 'தமிழுக்கும் சமஸ்கிருதத்துக்கும் இடையிலான தொடர்பு மிக ஆழமானது. இது இலக்கண நூல்களில் மட்டுமல்ல, நாட்டுப்புறக் கதைகளிலும் பிரதிபலிக்கிறது:',
        },
        {
          type: 'list',
          items: [
            'அகத்தியர் கதை: அகத்தியர் தமிழ் இலக்கணத்தையும் கலாச்சாரத்தையும் தெற்குக்கு கொண்டு வந்ததாக பல கதைகள் உள்ளன. இது வடக்கு (சமஸ்கிருத) மற்றும் தெற்கு (தமிழ்) மரபுகளின் சந்திப்பை குறிக்கிறது.',
            'இடைக்காலத்தில் தென்னிந்தியாவில் பல அறிஞர்கள் இரு மொழிகளிலும் எழுதினர். இதனால் மணிப்பிரவாளம் போன்ற கலவை பாணி உருவானது.',
            'இந்த வகையான பரிமாற்றம் வரலாற்றில் இயல்பானது. ஆங்கிலம் பிரெஞ்ச் மொழியால் பாதிக்கப்பட்டது போலவும், இந்தி-உருது ஒன்றாக வளர்ந்தது போலவும், தமிழும் சமஸ்கிருதமும் பல நூற்றாண்டுகளாக ஒன்றையொன்று பாதித்தன.',
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'சுருக்கம்',
      blocks: [
        {
          type: 'paragraph',
          text: 'தமிழ் இலக்கணமும் யாப்பும் தனித்துவமான அடிப்படையில் வளர்ந்தன. காலப்போக்கில் அவை சமஸ்கிருதத்தின் செல்வாக்கைப் பெற்றன, அதே நேரத்தில் தமிழும் சமஸ்கிருதத்தைப் பாதித்தது (குறிப்பாக ஒலி அமைப்பில்).',
        },
        {
          type: 'paragraph',
          text: 'லத்தீன் மற்றும் கிரேக்க Prosody உடன் ஒப்பிடும்போது, தமிழ் யாப்பு வேறு வழியில் வளர்ந்தது. இந்த வேறுபாடுகள் ஒன்று மற்றொன்றை விட உயர்ந்தது என்று அர்த்தமல்ல. ஒவ்வொரு மொழி மரபும் அதன் சொந்த தேவைகளுக்கு ஏற்ப வளர்ந்தது.',
        },
        {
          type: 'paragraph',
          text: 'தமிழுக்கும் சமஸ்கிருத்துக்கும் இடையிலான இந்த பரிமாற்றம், இரண்டு பழமையான இலக்கிய மரபுகள் நீண்ட காலம் ஒன்றாக வாழ்ந்ததன் இயற்கையான விளைவு.',
        },
      ],
    },
    {
      id: 'further-reading',
      title: 'மேலும் வாசிக்க',
      blocks: [
        {
          type: 'list',
          items: ['Tamil Prosody', 'Sanskrit prosody', 'Greek prosody', 'Latin prosody', 'paeon prosody'],
        },
      ],
    },
  ],
}

function renderInlineRichText(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let lastIndex = 0
  let key = 0

  for (const match of text.matchAll(pattern)) {
    const token = match[0]
    const index = match.index ?? 0

    if (index > lastIndex) {
      parts.push(...renderKeywordLinks(text.slice(lastIndex, index), `txt-${key++}`))
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold text-[var(--sea-ink)]">
          {token.slice(2, -2)}
        </strong>,
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${key++}`} className="italic">
          {token.slice(1, -1)}
        </em>,
      )
    } else {
      parts.push(
        <code
          key={`c-${key++}`}
          className="rounded bg-[var(--chip-bg)] px-1.5 py-0.5 text-[0.92em] text-[var(--sea-ink)]"
        >
          {token.slice(1, -1)}
        </code>,
      )
    }

    lastIndex = index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(...renderKeywordLinks(text.slice(lastIndex), `txt-end-${key++}`))
  }

  return parts
}

function renderKeywordLinks(text: string, keyPrefix: string): ReactNode[] {
  if (!text) return []

  const sortedKeywords = [...KEYWORD_LINKS].sort((a, b) => b.term.length - a.term.length)
  const escaped = sortedKeywords.map((k) => k.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const keywordRegex = new RegExp(`(${escaped.join('|')})`, 'g')
  const segments = text.split(keywordRegex)

  return segments.map((segment, idx) => {
    const hit = sortedKeywords.find((k) => k.term === segment)
    if (!hit) return segment

    return (
      <a
        key={`${keyPrefix}-${idx}-${hit.term}`}
        href={hit.href ?? buildGrokipediaUrl(hit.term)}
        target="_blank"
        rel="noreferrer"
        className={`${hit.className} underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]`}
      >
        {segment}
      </a>
    )
  })
}

function buildGrokipediaUrl(term: string): string {
  // Prefer canonical page pattern when term is page-safe ASCII words.
  const isPageSafe = /^[A-Za-z0-9 -]+$/.test(term)
  if (isPageSafe) {
    const pageSlug = term.trim().replace(/\s+/g, '_')
    return `${GROKIPEDIA_BASE}/page/${pageSlug}`
  }

  // Fallback to search for terms with non-ASCII/script-specific text.
  return `${GROKIPEDIA_BASE}/search?q=${encodeURIComponent(term)}`
}

export const Route = createFileRoute('/about/history')({
  validateSearch: (search: Record<string, unknown>) => ({
    lang: search.lang === 'ta' ? 'ta' : 'en',
  }),
  component: AboutHistory,
})

function AboutHistory() {
  const { lang } = Route.useSearch()
  const currentLang: HistoryLang = lang === 'ta' ? 'ta' : 'en'
  const isTamil = currentLang === 'ta'
  const sections = historySections[currentLang]

  return (
    <main className="page-wrap px-4 py-12 sm:py-16">
      <article className="island-shell mx-auto max-w-5xl rounded-2xl p-6 sm:p-10">
        <AboutSectionNav lang={currentLang} />
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="island-kicker m-0">About</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-sm font-medium text-[var(--sea-ink-soft)]">
              {isTamil ? 'மொழி:' : 'Language:'}
            </span>
            <Link
              to="/about/history"
              search={{ lang: 'en' as HistoryLang }}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                !isTamil
                  ? 'border-[var(--lagoon)] bg-[var(--chip-bg)] text-[var(--sea-ink)]'
                  : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]/50'
              }`}
            >
              English
            </Link>
            <Link
              to="/about/history"
              search={{ lang: 'ta' as HistoryLang }}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                isTamil
                  ? 'border-[var(--lagoon)] bg-[var(--chip-bg)] text-[var(--sea-ink)]'
                  : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)]/50'
              }`}
            >
              தமிழ்
            </Link>
          </div>
        </div>
        <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
          {isTamil ? 'வரலாற்றுப் பின்னணி' : 'Historical Context'}
        </h1>
        <p className="mb-6 text-base leading-relaxed text-[var(--sea-ink-soft)]">
          {isTamil
            ? 'தமிழ் யாப்பு மரபின் வளர்ச்சி, பரிமாற்றம் மற்றும் ஒப்பீட்டு பார்வையை சுருக்கமாகப் படிக்கவும்.'
            : 'Read a concise narrative of development, influence, and comparative context around Tamil prosody.'}
        </p>

        <div className="mb-6 rounded-xl border border-[var(--line)] bg-[var(--bg-base)]/70 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
            {isTamil ? 'பகுதிகள்' : 'Sections'}
          </p>
          <nav className="flex flex-wrap gap-2 text-sm">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-md border border-[var(--line)] px-2.5 py-1.5 text-[var(--lagoon-deep)] transition hover:border-[var(--lagoon)]/60"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        <section className="space-y-6">
          {sections.map((section) => (
            <section
              id={section.id}
              key={section.id}
              className="scroll-mt-24 rounded-xl border border-[var(--line)] bg-[var(--bg-base)]/80 p-5 sm:p-7"
            >
              <h2 className="text-xl font-semibold tracking-tight text-[var(--sea-ink)] sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-[var(--sea-ink-soft)]">
                {section.blocks.map((block, idx) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p key={`${section.id}-p-${idx}`} className="m-0">
                        {renderInlineRichText(block.text)}
                      </p>
                    )
                  }

                  if (block.type === 'list') {
                    return (
                      <ul key={`${section.id}-l-${idx}`} className="ml-6 list-disc space-y-2.5">
                        {block.items.map((item) => (
                          <li key={item} className="leading-8">
                            {renderInlineRichText(item)}
                          </li>
                        ))}
                      </ul>
                    )
                  }

                  if (block.type === 'quote') {
                    return (
                      <blockquote
                        key={`${section.id}-q-${idx}`}
                        className="rounded-r-lg border-l-4 border-[var(--lagoon)] bg-[var(--chip-bg)]/40 px-4 py-3 italic text-[var(--sea-ink)]"
                      >
                        <p className="m-0">{renderInlineRichText(block.text)}</p>
                        {block.byline ? (
                          <footer className="mt-2 text-xs not-italic text-[var(--sea-ink-soft)]">{block.byline}</footer>
                        ) : null}
                      </blockquote>
                    )
                  }

                  return (
                    <div key={`${section.id}-t-${idx}`} className="overflow-x-auto rounded-lg border border-[var(--line)]">
                      <table className="w-full min-w-[640px] border-collapse text-left text-xs sm:text-sm">
                        <thead className="bg-[var(--chip-bg)]/60 text-[var(--sea-ink)]">
                          <tr>
                            {block.headers.map((header) => (
                              <th key={header} className="border-b border-[var(--line)] px-3 py-2 font-semibold">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row, rowIdx) => (
                            <tr key={`${section.id}-row-${rowIdx}`} className="align-top">
                              {row.map((cell, cellIdx) => (
                                <td key={`${section.id}-cell-${rowIdx}-${cellIdx}`} className="border-b border-[var(--line)] px-3 py-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            to="/about/timeline"
            search={{ lang: currentLang }}
            className="font-medium text-[var(--lagoon-deep)] underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
          >
            {isTamil ? 'காலவரிசை' : 'Timeline'}
          </Link>
          <span className="text-[var(--sea-ink-soft)]" aria-hidden>
            |
          </span>
          <Link
            to="/about"
            className="font-medium text-[var(--lagoon-deep)] underline decoration-[var(--line)] underline-offset-2 transition hover:decoration-[var(--lagoon)]"
          >
            {isTamil ? 'About' : 'About'}
          </Link>
        </div>
      </article>
    </main>
  )
}
