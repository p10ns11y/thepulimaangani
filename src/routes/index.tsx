import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [poemText, setPoemText] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleParse = async () => {
    if (!poemText.trim()) return
    setLoading(true)
    try {
      // Dynamic import of WASM module
      const wasm = await import('../wasm/thepulimaangani_parser.js')
      await wasm.default()  // Initialize WASM
      const parseResult = wasm.parse_poem(poemText)
      setResult(parseResult)
    } catch (error) {
      console.error('Parsing error:', error)
      setResult('Error parsing poem')
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
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Enter your Tamil poem below to see its prosodic analysis, including syllables, feet, and metre type.
        </p>

        <div className="space-y-4">
          <textarea
            value={poemText}
            onChange={(e) => setPoemText(e.target.value)}
            placeholder="Enter Tamil poem here..."
            className="w-full h-32 p-4 border border-[var(--line)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] font-tamil text-[var(--sea-ink)] bg-white"
          />
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
            <h2 className="text-xl font-semibold mb-6 text-[var(--sea-ink)]">Analysis Result</h2>
            <div className="space-y-4">
              {(() => {
                try {
                  const data = JSON.parse(result);
                  return (
                    <div className="space-y-6">
                      <div className="p-4 bg-[var(--foam)] rounded-lg">
                        <h3 className="font-medium text-[var(--sea-ink)] mb-2">Original Text</h3>
                        <p className="text-lg font-tamil text-[var(--sea-ink)]">{data.original_text}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-[var(--surface)] rounded-lg">
                          <h4 className="font-medium text-[var(--sea-ink)] mb-1">Metre Type</h4>
                          <p className="text-[var(--sea-ink)]">{data.metre_type}</p>
                        </div>
                        <div className="p-4 bg-[var(--surface)] rounded-lg">
                          <h4 className="font-medium text-[var(--sea-ink)] mb-1">Vowels</h4>
                          <p className="text-[var(--sea-ink)]">{data.letter_count.vowel}</p>
                        </div>
                        <div className="p-4 bg-[var(--surface)] rounded-lg">
                          <h4 className="font-medium text-[var(--sea-ink)] mb-1">Consonants</h4>
                          <p className="text-[var(--sea-ink)]">{data.letter_count.consonant}</p>
                        </div>
                        <div className="p-4 bg-[var(--surface)] rounded-lg">
                          <h4 className="font-medium text-[var(--sea-ink)] mb-1">Vikalpa</h4>
                          <p className="text-[var(--sea-ink)]">{data.vikalpa_count}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-[var(--sea-ink)] mb-4">Prosodic Structure</h3>
                        <div className="space-y-4">
                          {data.lines.map((line: any, i: number) => (
                            <div key={i} className="p-4 bg-[var(--surface)] rounded-lg">
                              <h4 className="font-medium text-[var(--sea-ink)] mb-2">Line {i+1} - {line.line_class}</h4>
                              <div className="space-y-2">
                                {line.feet.map((foot: any, j: number) => (
                                  <div key={j} className="ml-4 p-3 bg-white rounded border border-[var(--line)]">
                                    <div className="font-medium text-[var(--sea-ink)] mb-1">Foot {j+1} - {foot.foot_type}</div>
                                    <div className="flex flex-wrap gap-2">
                                      {foot.syllables.map((syl: any, k: number) => (
                                        <span key={k} className="inline-flex items-center px-2 py-1 bg-[var(--foam)] text-[var(--sea-ink)] rounded text-sm font-tamil">
                                          {syl.text} <span className="ml-1 text-xs opacity-75">({syl.syllable_type === 'Ner' ? 'நேர்' : 'நிரை'})</span>
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
