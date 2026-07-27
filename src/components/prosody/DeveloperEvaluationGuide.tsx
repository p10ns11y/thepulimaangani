import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

/**
 * First-principles guide for the Developer Evaluation surface.
 * Story aligned with tamil-seiyul-alagi/METRE_ML_BEGINNER_GUIDE.md + METHODS_PORTFOLIO.
 */
export function DeveloperEvaluationGuide() {
  return (
    <article
      className="island-shell mx-auto max-w-3xl rounded-2xl p-6 sm:p-10"
      data-testid="developer-evaluation-guide"
    >
      <p className="island-kicker mb-2">Developer Evaluation</p>
      <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
        How metre ML works here
      </h1>
      <p className="text-[var(--sea-ink-soft)] mb-8 text-base leading-relaxed">
        Simple story: we do <strong className="text-[var(--sea-ink)]">not</strong> feed raw Tamil into a huge
        neural net for the product path. We <strong className="text-[var(--sea-ink)]">parse</strong> the poem into
        structure, summarize it as <strong className="text-[var(--sea-ink)]">51 numbers</strong>, then{' '}
        <strong className="text-[var(--sea-ink)]">guess coarse metre</strong> (four labels) with small models — and
        we keep classical rule checks <em>separate</em> so they never secretly rewrite the ML score.
      </p>

      <nav
        aria-label="On this page"
        className="border-rim/40 bg-surface-2/30 mb-10 rounded-xl border px-4 py-3 text-sm"
      >
        <p className="text-muted-foreground mb-2 text-[0.65rem] font-semibold tracking-wider uppercase">
          On this page
        </p>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 sm:flex-row sm:flex-wrap sm:gap-x-4">
          {[
            ['#story', 'Architecture'],
            ['#fields', 'What the numbers mean'],
            ['#inspiration', 'Where ideas came from'],
            ['#ladder', 'Evidence ladder'],
            ['#live-vs-train', 'Live vs training'],
            ['#pitfalls', 'Pitfalls'],
          ].map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                className="text-[var(--lagoon-deep)] font-medium underline decoration-[var(--line)] underline-offset-2 hover:decoration-[var(--lagoon)]"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* —— Architecture —— */}
      <section id="story" className="mb-12 scroll-mt-24">
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          1. Architecture: plant · observer · constraint
        </h2>
        <p className="text-[var(--sea-ink-soft)] mb-4 text-base leading-relaxed">
          Think like a control system. The <strong className="text-[var(--sea-ink)]">plant</strong> is the
          deterministic parser (structure). The <strong className="text-[var(--sea-ink)]">observer</strong> is ML
          (beliefs about metre). The <strong className="text-[var(--sea-ink)]">constraint</strong> is a soft
          classical sketch. Observers do not rewrite the plant; constraints do not silently rewrite the observer’s
          score. That separation is the main engineering rule.
        </p>

        <ArchPipelineDiagram />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PrincipleCard
            title="Plant"
            body="Normalize → syllables → feet → bonds → dense[51]. Same poem always gets the same structure for a given parser version."
          />
          <PrincipleCard
            title="Observer"
            body="Heuristic (+ optional hybrid), dense logistic, and prototype heads each cast a soft vote for one of four coarse metres."
          />
          <PrincipleCard
            title="Constraint"
            body="Soft classical sketch flags (e.g. low VenTalai mass). Shown beside ML — never fused into the hybrid score."
          />
        </div>
      </section>

      {/* —— Fields —— */}
      <section id="fields" className="mb-12 scroll-mt-24">
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          2. What Developer Evaluation numbers mean
        </h2>
        <p className="text-[var(--sea-ink-soft)] mb-4 text-base leading-relaxed">
          Everything below is about a <strong className="text-[var(--sea-ink)]">four-way</strong> belief over
          Venpaa · Aciriyappaa · Kalippaa · Vanjippaa. None of it is a Tolkāppiyam exam grade.
        </p>

        <div className="flex flex-col gap-3">
          <FieldExplain
            name="Entropy"
            firstPrinciple="How mixed is the four-way guess?"
            body="If one metre soaks almost all the probability mass, entropy is low (peaked, “clear”). If the mass is spread across several metres, entropy is high (flat, “uncertain”). Measured in bits. It describes the shape of the distribution — not whether the parse is classically correct."
          />
          <FieldExplain
            name="Confidence gap (Top1 − top2)"
            firstPrinciple="How far is the leader ahead of second place?"
            body="Also called epistemic margin. A large gap means the top guess stands out; a tiny gap means two metres look almost equally good. Still not classical proof — only how peaked the ML distribution is."
          />
          <FieldExplain
            name="Soft mass (0–1) on model heads"
            firstPrinciple="Relative strength of each head’s vote"
            body="Dense logistic and prototype k-NN (and the hybrid/heuristic path) each report a soft mass between 0 and 1. That is share of belief among the four classes for that head — not a calibrated “% chance of being right on unseen poems.”"
          />
          <FieldExplain
            name="Multi-head votes"
            firstPrinciple="Several small models, same poem, side by side"
            body="Live multi-head votes are fitted on special_type anthology rows. If you parse those same poems in the UI, the heads can look excellent because they are partly in-sample. Held-out ADOPT evidence is the dated baseline freeze in training reports — not “all heads agreed in the browser.”"
          />
          <FieldExplain
            name="Soft classical sketch"
            firstPrinciple="Lightweight structural flags for the ML top guess"
            body="Flags such as classical:venpaa_low_ventalai_mass are a soft sketch of structure, not full classical scholarship. They answer “does anything look odd for this ML top label?” — not “this is proven Venpaa.”"
          />
          <FieldExplain
            name="Dual-truth · separation policy"
            firstPrinciple="ML and classical never share one fused score"
            body="dual_truth keeps ML metre and classical sketch in parallel (e.g. separation_policy like ml_scores_parallel_to_classical_violations). Dual-compare reports (research) use buckets such as ml_only_classical_flags: ML picked a label while classical raised flags — still two truths, one table."
          />
          <FieldExplain
            name="Pattern features"
            firstPrinciple="Which dense slots pushed this poem’s logistic vote"
            body="Top dense indices with weights and directions for this parse. They are interpretability for the dense head — not a full feature catalogue for every method in the portfolio."
          />
        </div>
      </section>

      {/* —— Inspiration / fields —— */}
      <section id="inspiration" className="mb-12 scroll-mt-24">
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          3. How many “fields” and where ideas came from
        </h2>
        <p className="text-[var(--sea-ink-soft)] mb-4 text-base leading-relaxed">
          The product path uses a fixed <strong className="text-[var(--sea-ink)]">51-dimensional dense
          vector</strong> (schema v1). That is not arbitrary: each slot is a measured structural summary —
          counts, linkage histograms, foot bins — with no raw poem text. Meaning of each index is pinned by the
          semantics ledger so weights stay comparable after code changes.
        </p>

        <InspirationDiagram />

        <ul className="text-[var(--sea-ink-soft)] mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed">
          <li>
            <strong className="text-[var(--sea-ink)]">Ontology</strong> — Poem → Line → Foot → Syllable; four
            coarse metres; Ner/Nirai; talai/linkage types. ML may not invent silent enums.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Semantics</strong> — What dense[j] means; score scales
            (heuristic integer vs hybrid probability vs soft mass).
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Anthology</strong> — special_type rows = primary gold for
            ADOPT; variation rows = stress only (do not bulk-train as gold).
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Sklearn-map discipline</strong> — small N, engineered
            features → logistic / linear / prototypes first; not raw-text deep nets first.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Control metaphor</strong> — plant / sensor / observer /
            separation principle (estimation ⟂ classical constraints).
          </li>
        </ul>
      </section>

      {/* —— Ladder —— */}
      <section id="ladder" className="mb-12 scroll-mt-24">
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          4. Evidence ladder (what we achieved, in order)
        </h2>
        <p className="text-[var(--sea-ink-soft)] mb-4 text-base leading-relaxed">
          Research freezes meaning before models, then measures, then freezes patterns, then adds classical as an
          orthogonal judge — so comparison is scientific, not retrospective storytelling.
        </p>
        <LadderDiagram />
        <ol className="text-[var(--sea-ink-soft)] mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed">
          <li>
            <strong className="text-[var(--sea-ink)]">S00–S03</strong> — Ontology, dense semantics, anthology
            split, ledger fingerprint.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">A00–A02</strong> — Baseline freeze, metrics harness,
            dual-truth wire schema.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">A03–A04</strong> — Dense logistic + prototypes (live
            multi-head).
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">A05–A13</strong> — Discovery, pattern cards, head A/B
            tables; freeze before classical.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">D</strong> — Soft classical sketch + dual-compare (e.g.
            ml_only_classical_flags) without editing hybrid scores.
          </li>
        </ol>
      </section>

      {/* —— Live vs train —— */}
      <section id="live-vs-train" className="mb-12 scroll-mt-24">
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          5. Live browser vs offline training
        </h2>
        <LiveTrainDiagram />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-rim/40 border-b">
                <th className="text-[var(--sea-ink)] py-2 pr-3 font-semibold">Activity</th>
                <th className="text-[var(--sea-ink)] py-2 pr-3 font-semibold">Data</th>
                <th className="text-[var(--sea-ink)] py-2 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-[var(--sea-ink-soft)]">
              <tr className="border-rim/25 border-b">
                <td className="py-2 pr-3">Baseline freeze / ADOPT</td>
                <td className="py-2 pr-3">special_type</td>
                <td className="py-2">Dated top-1 / MRR evidence in reports</td>
              </tr>
              <tr className="border-rim/25 border-b">
                <td className="py-2 pr-3">Live multi-head</td>
                <td className="py-2 pr-3">Fitted on special_type, predict</td>
                <td className="py-2">UX comparison (in-sample on those poems)</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">variation</td>
                <td className="py-2 pr-3">Stress rows</td>
                <td className="py-2">Where models fail — not sole ADOPT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* —— Pitfalls —— */}
      <section id="pitfalls" className="mb-10 scroll-mt-24">
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          6. Pitfalls (first principles)
        </h2>
        <ul className="text-[var(--sea-ink-soft)] list-disc space-y-2 pl-5 text-base leading-relaxed">
          <li>
            <strong className="text-[var(--sea-ink)]">“0.99 means 99% correct”</strong> — No; soft mass / relative
            strength.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">“classical_ok means proven”</strong> — No; soft sketch,
            dual-truth only.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Training on all variation rows</strong> — Poisons primary
            gold.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Changing dense layout without schema bump</strong> — Breaks
            weights and meaning.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Expecting every research method in the UI</strong> — Most of
            Tier B–C stays offline; this app shows the product surface.
          </li>
        </ul>
      </section>

      <footer className="border-rim/40 border-t pt-6">
        <p className="text-[var(--sea-ink-soft)] mb-3 text-sm leading-relaxed">
          Deeper repo docs (source of this page’s story):
        </p>
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
          <li>
            <DocLink href="https://github.com/p10ns11y/thepulimaangani/blob/malar/tamil-seiyul-alagi/METRE_ML_BEGINNER_GUIDE.md">
              METRE_ML_BEGINNER_GUIDE.md
            </DocLink>
          </li>
          <li>
            <DocLink href="https://github.com/p10ns11y/thepulimaangani/blob/malar/tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md">
              METRE_ML_METHODS_PORTFOLIO.md
            </DocLink>
          </li>
          <li>
            <DocLink href="https://github.com/p10ns11y/thepulimaangani/blob/malar/tamil-seiyul-alagi/PARSE_FEATURES.md">
              PARSE_FEATURES.md
            </DocLink>
          </li>
        </ul>
        <p className="mt-6 mb-0">
          <Link
            to="/"
            className="text-[var(--lagoon-deep)] text-sm font-medium underline decoration-[var(--line)] underline-offset-2 hover:decoration-[var(--lagoon)]"
          >
            ← Back to Prosody Lab
          </Link>
        </p>
      </footer>
    </article>
  )
}

function PrincipleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-rim/40 bg-surface-2/25 rounded-xl border px-3.5 py-3">
      <p className="text-[var(--sea-ink)] m-0 mb-1 text-sm font-semibold">{title}</p>
      <p className="text-[var(--sea-ink-soft)] m-0 text-[0.8rem] leading-snug">{body}</p>
    </div>
  )
}

function FieldExplain({
  name,
  firstPrinciple,
  body,
}: {
  name: string
  firstPrinciple: string
  body: string
}) {
  return (
    <div className="border-rim/40 bg-surface-2/20 rounded-xl border px-4 py-3">
      <h3 className="text-[var(--sea-ink)] m-0 text-base font-semibold">{name}</h3>
      <p className="text-[var(--lagoon-deep)] m-0 mt-1 text-[0.8rem] font-medium leading-snug">
        First principle: {firstPrinciple}
      </p>
      <p className="text-[var(--sea-ink-soft)] m-0 mt-2 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-[var(--lagoon-deep)] font-medium underline decoration-[var(--line)] underline-offset-2 hover:decoration-[var(--lagoon)]"
    >
      {children}
    </a>
  )
}

/** Horizontal pipeline: text → plant → dense → heads ∥ classical → UI */
function ArchPipelineDiagram() {
  const stages = [
    { label: 'Tamil text', sub: 'input' },
    { label: 'Parse plant', sub: 'structure' },
    { label: 'dense[51]', sub: 'features' },
    { label: 'ML heads', sub: 'observer' },
    { label: 'metre_ml', sub: 'product JSON' },
    { label: 'UI tabs', sub: 'learner + dev' },
  ]
  return (
    <figure
      className="border-rim/40 bg-surface-2/15 overflow-x-auto rounded-xl border p-4"
      aria-label="Pipeline from poem text to UI"
    >
      <div className="flex min-w-[36rem] items-stretch gap-1.5">
        {stages.map((s, i) => (
          <div key={s.label} className="flex min-w-0 flex-1 items-center gap-1.5">
            <div className="border-rim/50 bg-surface-1/80 flex min-h-[4.25rem] w-full flex-col items-center justify-center rounded-lg border px-2 py-2 text-center">
              <span className="text-[var(--sea-ink)] text-[0.72rem] font-semibold leading-tight">
                {s.label}
              </span>
              <span className="text-muted-foreground mt-0.5 text-[0.62rem]">{s.sub}</span>
            </div>
            {i < stages.length - 1 ? (
              <span className="text-muted-foreground shrink-0 text-sm" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="border-rim/30 mt-3 flex flex-wrap items-center justify-center gap-2 border-t pt-3">
        <span className="border-rim/40 bg-surface-1/70 text-[var(--sea-ink)] rounded-md border px-2 py-1 text-[0.68rem] font-medium">
          Soft classical sketch
        </span>
        <span className="text-muted-foreground text-[0.65rem]">joins metre_ml as dual-truth only</span>
      </div>
      <figcaption className="text-muted-foreground mt-2 text-center text-[0.7rem]">
        Engineering flow: deterministic structure first, statistical heads second, classical flags in parallel.
      </figcaption>
    </figure>
  )
}

function InspirationDiagram() {
  const pillars = [
    { t: 'Ontology', d: 'Entities & bonds' },
    { t: 'Semantics', d: 'dense[j] meaning' },
    { t: 'Anthology', d: 'special_type gold' },
    { t: 'Sklearn map', d: 'linear first' },
    { t: 'Control', d: 'plant ⟂ observer' },
  ]
  return (
    <figure
      className="border-rim/40 bg-surface-2/15 rounded-xl border p-4"
      aria-label="Inspiration sources for dense features and ML path"
    >
      <div className="flex flex-wrap justify-center gap-2">
        {pillars.map((p) => (
          <div
            key={p.t}
            className="border-rim/45 bg-surface-1/85 min-w-[6.5rem] flex-1 rounded-lg border px-2.5 py-2 text-center sm:max-w-[8rem]"
          >
            <p className="text-[var(--sea-ink)] m-0 text-[0.75rem] font-semibold">{p.t}</p>
            <p className="text-muted-foreground m-0 mt-0.5 text-[0.62rem]">{p.d}</p>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground my-2 text-center text-sm" aria-hidden>
        ↓
      </p>
      <div className="border-rim/50 bg-[color:color-mix(in_oklab,var(--lagoon)_12%,var(--surface-1))] mx-auto max-w-md rounded-lg border px-3 py-2.5 text-center">
        <p className="text-[var(--sea-ink)] m-0 text-sm font-semibold">dense[51] + multi-head product surface</p>
        <p className="text-muted-foreground m-0 mt-0.5 text-[0.68rem]">
          Fixed schema · special_type fit · dual-truth wire
        </p>
      </div>
      <figcaption className="text-muted-foreground mt-2 text-center text-[0.7rem]">
        Five inspiration pillars collapse into one measured feature vector and honest multi-head UI.
      </figcaption>
    </figure>
  )
}

function LadderDiagram() {
  const rungs = [
    { id: 'S', label: 'SOA foundations', note: 'meaning pinned' },
    { id: 'A0', label: 'Baseline + metrics', note: 'ADOPT freeze' },
    { id: 'A2', label: 'Dual-truth schema', note: 'no fusion' },
    { id: 'A3–4', label: 'Logistic + prototypes', note: 'live heads' },
    { id: 'A12', label: 'Pattern freeze', note: 'before classical' },
    { id: 'D', label: 'Classical dual path', note: 'orthogonal judge' },
  ]
  return (
    <figure
      className="border-rim/40 bg-surface-2/15 rounded-xl border p-4"
      aria-label="Evidence ladder from SOA to classical dual path"
    >
      <ol className="m-0 flex list-none flex-col gap-0 p-0">
        {rungs.map((r, i) => (
          <li key={r.id} className="flex flex-col items-stretch">
            <div className="border-rim/45 bg-surface-1/80 flex items-center gap-3 rounded-lg border px-3 py-2">
              <span className="bg-surface-3/80 text-[var(--sea-ink)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[0.65rem] font-bold">
                {r.id}
              </span>
              <div className="min-w-0">
                <p className="text-[var(--sea-ink)] m-0 text-sm font-semibold">{r.label}</p>
                <p className="text-muted-foreground m-0 text-[0.68rem]">{r.note}</p>
              </div>
            </div>
            {i < rungs.length - 1 ? (
              <div className="text-muted-foreground flex justify-center py-0.5 text-xs" aria-hidden>
                ↓
              </div>
            ) : null}
          </li>
        ))}
      </ol>
      <figcaption className="text-muted-foreground mt-2 text-center text-[0.7rem]">
        Each rung freezes evidence so the next cannot silently redefine meaning.
      </figcaption>
    </figure>
  )
}

function LiveTrainDiagram() {
  return (
    <figure
      className="border-rim/40 bg-surface-2/15 grid gap-3 rounded-xl border p-4 sm:grid-cols-2"
      aria-label="Offline training versus live browser inference"
    >
      <div className="border-rim/40 bg-surface-1/75 rounded-lg border px-3 py-3">
        <p className="text-[var(--sea-ink)] m-0 text-sm font-semibold">Offline (developer)</p>
        <ol className="text-[var(--sea-ink-soft)] mt-2 mb-0 list-decimal space-y-1 pl-4 text-[0.78rem] leading-snug">
          <li>Parse special_type anthology</li>
          <li>Freeze metrics / fit heads</li>
          <li>Write ADOPT reports</li>
        </ol>
      </div>
      <div className="border-rim/40 bg-surface-1/75 rounded-lg border px-3 py-3">
        <p className="text-[var(--sea-ink)] m-0 text-sm font-semibold">Live (browser WASM)</p>
        <ol className="text-[var(--sea-ink-soft)] mt-2 mb-0 list-decimal space-y-1 pl-4 text-[0.78rem] leading-snug">
          <li>User poem → parse_poem_wasm</li>
          <li>First call may warm cached heads</li>
          <li>Predict only → metre_ml JSON</li>
        </ol>
      </div>
      <figcaption className="text-muted-foreground sm:col-span-2 text-center text-[0.7rem]">
        ADOPT lives in reports. Live multi-head is a product comparison tool, not the ADOPT certificate.
      </figcaption>
    </figure>
  )
}
