import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

// Mapping functions for user-friendly display
const getLineClassDisplay = (lineClass: string): string => {
  const classMap: { [key: string]: string } = {
    'kuRaLaTi': 'குறளடி',
    'ci_ntaTi': 'சிந்தடி',
    'taVi_cco_l': 'தவிச்சொல்',
    '_aLavaTi': 'அளவடி',
    'neTilaTi': 'நெடிலடி'
  }
  return classMap[lineClass] || lineClass
}

const getFootTypeDisplay = (footType: string): string => {
  const footMap: { [key: string]: string } = {
    'tEmA': 'தேமா',
    'puLimA': 'புளிமா',
    'kUviLa_m': 'கூவிளம்',
    'karuviLa_m': 'கருவிளம்',
    'mA': 'மா',
    'viLa_m': 'விளம்'
  }
  return footMap[footType] || footType
}

function App() {
  const [poemText, setPoemText] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Tamil Unicode ranges for validation
  const isTamilText = (text: string): boolean => {
    const tamilRegex = /[\u0B80-\u0BFF]/; // Tamil Unicode block
    return tamilRegex.test(text);
  }

  const validateInput = (text: string): string | null => {
    const trimmed = text.trim();
    if (!trimmed) {
      return 'Please enter some text to analyze.';
    }
    if (!isTamilText(trimmed)) {
      return 'Please enter text containing Tamil characters (தமிழ் எழுத்துக்கள்).';
    }
    if (trimmed.length < 2) {
      return 'Please enter more text for meaningful analysis.';
    }
    return null;
  }

  const handleParse = async () => {
    const inputError = validateInput(poemText);
    if (inputError) {
      setValidationError(inputError);
      setResult(null);
      return;
    }

    setValidationError(null);
    setLoading(true);
    try {
      // Dynamic import of WASM module
      const wasm = await import('../wasm/thepulimaangani_parser.js')
      await wasm.default()  // Initialize WASM
      const parseResult = wasm.parse_poem_wasm(poemText)

      // Check if parsing returned an error
      if (parseResult.includes('Error') || parseResult.trim() === '') {
        throw new Error('Unable to analyze the provided text. Please check that it contains valid Tamil poetry.');
      }

      setResult(parseResult)
    } catch (error) {
      console.error('Parsing error:', error)
      setValidationError(error instanceof Error ? error.message : 'An error occurred while analyzing the poem. Please try again.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Thepulimaangani - Tamil Prosody Parser</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Analyze Tamil Poetry
        </h1>
        <p className="mb-6 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Enter your Tamil poem below to see its prosodic analysis, including syllables, feet, and metre type.
        </p>

        <div className="mb-8 p-4 bg-[var(--foam)] rounded-lg border border-[var(--line)]">
          <h3 className="font-medium text-[var(--sea-ink)] mb-2">Quick Start</h3>
          <p className="text-sm text-[var(--sea-ink-soft)] mb-3">
            Try analyzing traditional Tamil poetry. The parser supports major metres like வெண்பா, வெண்கலிப்பா, ஆசிரியப்பா, and கலிப்பா.
          </p>
          <button
            onClick={() => setPoemText(
              "சுடர்த்தொடீஇ கேளாய் தெருவில்நாம் ஆடும்\nமணற்சிற்றில் காலில் சிதையா அடைச்சிய\nகோதை பரிந்து வரிப்பந்து கொண்டோடி\nநோதக்க செய்யும் சிறுபட்டி மேல்ஓர்நாள்\nஅன்னையும் யானும் இருந்தேமா இல்லிரே\nஉண்ணுநீர் வேட்டேன் எனவந்தாற் கன்னை\nஅடர்பொற் சிரகத்தால் வாக்கிச் சுடரிழாய்\nஉண்ணுநீர் ஊட்டிவா என்றாள் எனயானும்\nதன்னை அறியாது சென்றேன்மற் றென்னை\nவளைமுன்கை பற்றி நலியத் தெருமந்திட்(டு)\nஅன்னாய் இவனொருவன் செய்ததுகாண்’ என்றேனா\nஅன்னை அலறிப் படர்தரத் தன்னையான்\nஉண்ணுநீர் விக்கினான் என்றேனா அன்னையும்\nதன்னைப் புறம்பழித்து நீவமற் றென்னைக்\nகடைக்கணால் கொல்வான்போல் நோக்கி நகைக்கூட்டம்\nசெய்தானக் கள்வன் மகன்",
            )}
            className="px-4 py-2 text-sm bg-white text-[var(--sea-ink)] rounded border border-[var(--line)] hover:bg-[var(--surface)] transition"
          >
            Load Sample Poem
          </button>
        </div>

        <div className="space-y-4">
          <textarea
            value={poemText}
            onChange={(e) => setPoemText(e.target.value)}
            placeholder="Enter Tamil poem here..."
            className="w-full h-32 p-4 border border-[var(--line)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] font-tamil text-[var(--sea-ink)] bg-[var(--surface-strong)]"
          />
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{validationError}</p>
            </div>
          )}
          <button
            onClick={handleParse}
            disabled={loading}
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] disabled:opacity-50"
          >
            {loading ? 'Parsing...' : 'Parse Poem'}
          </button>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-white border border-[var(--line)] rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--sea-ink)]">Analysis Result</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="px-3 py-1.5 text-sm bg-[var(--foam)] text-[var(--sea-ink)] rounded border border-[var(--line)] hover:bg-[var(--surface)] transition"
                  title="Copy results to clipboard"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([result], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'tamil-prosody-analysis.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 text-sm bg-[var(--foam)] text-[var(--sea-ink)] rounded border border-[var(--line)] hover:bg-[var(--surface)] transition"
                  title="Download results as JSON"
                >
                  Export JSON
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {(() => {
                try {
                  debugger;
                  const data = JSON.parse(result);
                  return (
                    <div className="space-y-6">
                      <div className="p-4 bg-[var(--foam)] rounded-lg">
                        <h3 className="font-medium text-[var(--sea-ink)] mb-2">Original Text</h3>
                        <p className="text-lg font-tamil text-[var(--sea-ink)]">{data.original_text}</p>
                      </div>

                       <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                         <h3 className="font-medium text-gray-900 mb-3">Analysis Summary</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                           <div className="bg-gray-50 p-3 rounded">
                             <span className="text-gray-600">Lines:</span>
                             <span className="ml-2 font-medium text-gray-900">{data.lines.length}</span>
                           </div>
                           <div className="bg-gray-50 p-3 rounded">
                             <span className="text-gray-600">Feet:</span>
                             <span className="ml-2 font-medium text-gray-900">{data.lines.reduce((sum: number, line: any) => sum + line.feet.length, 0)}</span>
                           </div>
                           <div className="bg-gray-50 p-3 rounded">
                             <span className="text-gray-600">Syllables:</span>
                             <span className="ml-2 font-medium text-gray-900">{data.syllables.length}</span>
                           </div>
                           {/* <div className="bg-gray-50 p-3 rounded">
                             <span className="text-gray-600">Bonds:</span>
                             <span className="ml-2 font-medium text-gray-900">{data.word_bond.match(/Total bonds: (\d+)/)?.[1] || 'N/A'}</span>
                           </div> */}
                         </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                           <h4 className="font-medium text-gray-900 mb-1">Metre Type</h4>
                           <p className="text-gray-700 font-medium">{data.metre_type}</p>
                         </div>
                         <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                           <h4 className="font-medium text-gray-900 mb-1">Letter Count</h4>
                           <p className="text-gray-700 font-medium">{data.letter_count}</p>
                         </div>
                         {/* <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                           <h4 className="font-medium text-gray-900 mb-1">Consonants</h4>
                           <p className="text-gray-700 font-medium">{data.letter_count.consonant}</p>
                         </div> */}
                         <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                           <h4 className="font-medium text-gray-900 mb-1">Vikalpa</h4>
                           <p className="text-gray-700 font-medium">{data.vikalpa_count}</p>
                         </div>
                       </div>

                       <div>
                         <h3 className="font-medium text-gray-900 mb-4">Prosodic Structure</h3>
                         <div className="space-y-4">
                           {data.lines.map((line: any, i: number) => (
                             <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                               <h4 className="font-medium text-gray-900 mb-3">
                                 Line {i+1} <span className="text-gray-600 text-sm ml-2">({getLineClassDisplay(line.line_class)})</span>
                               </h4>
                               <div className="space-y-3">
                                 {line.feet.map((foot: any, j: number) => (
                                   <div key={j} className="ml-4 p-3 bg-gray-50 rounded border border-gray-100">
                                     <div className="font-medium text-gray-900 mb-2">
                                       Foot {j+1} <span className="text-gray-600 text-sm ml-2">({getFootTypeDisplay(foot.foot_type)})</span>
                                     </div>
                                     <div className="flex flex-wrap gap-2">
                                       {foot.syllables.map((syl: any, k: number) => (
                                         <span key={k} className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-900 rounded text-sm font-medium border border-blue-200">
                                           <span className="font-tamil mr-1">{syl.text}</span>
                                           <span className="text-xs text-blue-700">({syl.syllable_type === 'Ner' ? 'நேர்' : 'நிரை'})</span>
                                         </span>
                                       ))}
                                     </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {data.errors && data.errors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-2">Errors</h4>
                          <ul className="text-red-700">
                            {data.errors.map((error: string, idx: number) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  console.error('JSON parse error:', e);
                  return (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Error</h4>
                      <pre className="whitespace-pre-wrap text-red-700">{result}</pre>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
