import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import {
  DEFAULT_DEV_EVAL_TAB,
  parseDevEvalTab,
  type DevEvalTab,
} from '#/lib/devEvalTabs'

const GITHUB_BLOB =
  'https://github.com/p10ns11y/thepulimaangani/blob/malar/tamil-seiyul-alagi'

export type DeveloperEvaluationGuideProps = {
  /** Active tab from URL search (`?tab=…`). Defaults to Simple guide. */
  tab?: DevEvalTab
  /** Called when the user selects a tab (parent updates shareable URL). */
  onTabChange?: (tab: DevEvalTab) => void
}

/**
 * Guide for Developer Evaluation: plain-language story + research field catalogue.
 * Content aligned with METRE_ML_BEGINNER_GUIDE.md and METRE_ML_METHODS_PORTFOLIO.md.
 * Tab state is controlled so `/developer-evaluation?tab=` is shareable.
 */
export function DeveloperEvaluationGuide({
  tab = DEFAULT_DEV_EVAL_TAB,
  onTabChange,
}: DeveloperEvaluationGuideProps = {}) {
  const activeTab = parseDevEvalTab(tab)

  return (
    <article
      className="island-shell mx-auto max-w-3xl rounded-2xl p-6 sm:p-10"
      data-testid="developer-evaluation-guide"
      data-active-tab={activeTab}
    >
      <p className="island-kicker mb-2">Developer Evaluation</p>
      <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
        How metre guessing works here
      </h1>
      <p className="text-[var(--sea-ink-soft)] mb-6 text-base leading-relaxed">
        We do <strong className="text-[var(--sea-ink)]">not</strong> feed raw Tamil into a big neural net in the
        browser. We turn the poem into structure, pack that into{' '}
        <strong className="text-[var(--sea-ink)]">51 numbers</strong>, then small models vote among{' '}
        <strong className="text-[var(--sea-ink)]">four metre families</strong>. Classical rule checks stay{' '}
        <em>separate</em> — they never secretly rewrite the model score.
      </p>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          onTabChange?.(parseDevEvalTab(value))
        }}
        className="w-full"
      >
        <TabsList className="bg-surface-3/80 border-rim/40 mb-6 h-auto w-full flex-wrap justify-start gap-0.5 border p-1 sm:w-fit">
          <TabsTrigger
            value="simple"
            className="text-xs sm:text-sm"
            data-testid="dev-eval-tab-simple"
          >
            Simple guide
          </TabsTrigger>
          <TabsTrigger
            value="research"
            className="text-xs sm:text-sm"
            data-testid="dev-eval-tab-research"
          >
            Research fields
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            className="text-xs sm:text-sm"
            data-testid="dev-eval-tab-docs"
          >
            Training & docs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="simple"
          forceMount
          className="outline-none data-[state=inactive]:hidden"
          data-testid="dev-eval-panel-simple"
        >
          <SimpleGuideTab />
        </TabsContent>
        <TabsContent
          value="research"
          forceMount
          className="outline-none data-[state=inactive]:hidden"
          data-testid="dev-eval-panel-research"
        >
          <ResearchFieldsTab />
        </TabsContent>
        <TabsContent
          value="docs"
          forceMount
          className="outline-none data-[state=inactive]:hidden"
          data-testid="dev-eval-panel-docs"
        >
          <TrainingDocsTab />
        </TabsContent>
      </Tabs>

      <p className="border-rim/40 mt-8 mb-0 border-t pt-6">
        <Link
          to="/"
          className="text-[var(--lagoon-deep)] text-sm font-medium underline decoration-[var(--line)] underline-offset-2 hover:decoration-[var(--lagoon)]"
        >
          ← Back to Prosody Lab
        </Link>
      </p>
    </article>
  )
}

function SimpleGuideTab() {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          Three parts that never mix scores
        </h2>
        <p className="text-[var(--sea-ink-soft)] mb-4 text-base leading-relaxed">
          Like a machine with sensors and a separate safety checklist: the structure engine measures the poem;
          the models guess the metre; a light classical sketch can raise flags — but the sketch does not change
          the model’s number.
        </p>
        <ArchPipelineDiagram />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <PrincipleCard
            title="Structure engine"
            body="Text → syllables → words/feet → bonds → 51 numbers. Same poem, same structure for a given parser version."
          />
          <PrincipleCard
            title="Small models"
            body="Rule-ish hybrid path, dense logistic, and “looks like mean Venpaa” prototypes each cast a share (0–1)."
          />
          <PrincipleCard
            title="Light classical flags"
            body="Optional soft warnings for the model’s top guess. Shown beside ML — never fused into one score."
          />
        </div>
      </section>

      <section>
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          What you see in the lab tab (plain words)
        </h2>
        <div className="flex flex-col gap-3">
          <FieldExplain
            name="How mixed? (entropy)"
            firstPrinciple="Is the model sure, or torn between metres?"
            body="If almost all the weight sits on one family, the number is low (clear). If weight is spread across several families, it is high (unclear). This is about the shape of the guess — not a scholar’s grade."
          />
          <FieldExplain
            name="Lead over #2 (confidence gap)"
            firstPrinciple="How far is first place ahead of second?"
            body="A big lead means one metre clearly wins among the model votes. A tiny lead means two look almost the same. Still not classical proof."
          />
          <FieldExplain
            name="Model votes"
            firstPrinciple="Several small tools voting on the same poem"
            body="Each head shows a 0–1 share for its favourite family. Use them to compare tools. On poems from our training anthology, votes can look very strong because the models already saw similar rows — that is normal and honest to say out loud."
          />
          <FieldExplain
            name="Strong signals (pattern features)"
            firstPrinciple="Which of the 51 numbers mattered for this poem?"
            body="A short list of dense slots that pushed the logistic vote. Useful for debugging — not the full research catalogue."
          />
          <FieldExplain
            name="Classical flags (when present)"
            firstPrinciple="Anything odd for the model’s top label?"
            body="Soft structural notes only. They do not re-score the model. Research dual-compare tables (offline) can group cases like “model said X, flags raised” — still two truths, one table."
          />
        </div>
      </section>

      <section>
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          Live browser vs offline training
        </h2>
        <LiveTrainDiagram />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-rim/40 border-b">
                <th className="text-[var(--sea-ink)] py-2 pr-3 font-semibold">Where</th>
                <th className="text-[var(--sea-ink)] py-2 pr-3 font-semibold">What happens</th>
                <th className="text-[var(--sea-ink)] py-2 font-semibold">Why it matters</th>
              </tr>
            </thead>
            <tbody className="text-[var(--sea-ink-soft)]">
              <tr className="border-rim/25 border-b">
                <td className="py-2 pr-3">Live (this site)</td>
                <td className="py-2 pr-3">Parse in WASM → show votes for this poem</td>
                <td className="py-2">Fast feedback while you write</td>
              </tr>
              <tr className="border-rim/25 border-b">
                <td className="py-2 pr-3">Offline training</td>
                <td className="py-2 pr-3">Fit heads on special_type rows; freeze metrics</td>
                <td className="py-2">Honest scores live in dated reports</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Stress rows</td>
                <td className="py-2 pr-3">variation poems</td>
                <td className="py-2">Where models fail — not the main grade</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          Easy mistakes
        </h2>
        <ul className="text-[var(--sea-ink-soft)] list-disc space-y-2 pl-5 text-base leading-relaxed">
          <li>
            <strong className="text-[var(--sea-ink)]">“0.99 means 99% right”</strong> — No; it is share among
            four options for that tool.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">“Flags mean the metre is proven”</strong> — No; light
            sketch only.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Training only on hard variation rows</strong> — Muddies
            the main grade.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Expecting every research method in the UI</strong> — Most
            stay offline; the lab shows the product surface.
          </li>
        </ul>
      </section>
    </div>
  )
}

function ResearchFieldsTab() {
  return (
    <div className="flex flex-col gap-8" data-testid="dev-eval-research-fields">
      <p className="text-[var(--sea-ink-soft)] m-0 text-base leading-relaxed">
        Fields and methods we researched (and ship or keep offline). Names match the portfolio: control
        systems, machine learning, information theory, and data mining — mapped onto this poem parser.
      </p>

      <DomainBlock title="Control systems & dynamical systems" subtitle="Separation of plant and observer">
        <FieldTable
          headers={['Field / idea', 'In this project', 'Online UI?', 'Offline research?']}
          rows={[
            ['Plant', 'Parse stages: units → syllables → feet → bonds', 'Yes (structure)', 'Yes'],
            ['Sensors', 'dense[51], linkage histograms', 'Yes (numbers)', 'Yes'],
            ['State', '4-way metre belief', 'Yes (votes)', 'Yes'],
            ['Observer', 'Hybrid / logistic / prototype heads', 'Yes', 'Yes'],
            ['Feedback', 'Live re-parse debounce (UX rate limit)', 'Yes', 'N/A'],
            ['Reference', 'Gold parent_metre (special_type)', 'Indirect', 'Yes (metrics)'],
            ['Noise', 'Short poems, variation stress rows', 'Seen live', 'Yes (robustness)'],
            ['Separation principle', 'ML ⟂ classical flags (never fuse scores)', 'Yes (policy)', 'Yes'],
            ['Identification', 'Weight fit, PCA, prototypes after schema pin', 'Cached heads', 'Yes'],
            ['Sensitivity', '∂score/∂dense_j, ablation, counterfactual flips', 'Pattern list (light)', 'Yes (A10–A11)'],
            ['Stability', 'Schema + weight pins; ledger fingerprint', 'Pinned WASM', 'Yes (S03)'],
          ]}
        />
      </DomainBlock>

      <DomainBlock title="Machine learning (sklearn-map path)" subtitle="Small N, engineered features first">
        <FieldTable
          headers={['Method', 'Tier', 'Role', 'Online UI?', 'Offline?']}
          rows={[
            ['Multinomial / hybrid logistic', 'A', 'Shipped ranking + dense baseline', 'Yes', 'Yes'],
            ['Dense logistic (cached)', 'A', 'Soft class shares on z-scored dense', 'Yes (head)', 'Yes'],
            ['Class prototypes / k-NN mass', 'A', '“Looks like mean Venpaa”', 'Yes (head)', 'Yes'],
            ['Linear SVM', 'A', 'Second linear ceiling', 'No', 'Yes'],
            ['Calibration (Platt / isotonic)', 'A', 'Honest probability talk', 'Partial', 'Yes'],
            ['PCA / SVD, LDA', 'A', 'Directions in dense space', 'No', 'Yes'],
            ['Random Forest / GBDT', 'B', 'Importances → distill rules', 'No', 'Yes'],
            ['Kernel SVM, GMM, clustering', 'B', 'Nonlinear / structure discovery', 'No', 'Yes'],
            ['HMM / CRF on Ner–Nirai', 'B', 'Sequence / structured labels', 'No', 'Yes'],
            ['1D CNN / small Transformer', 'C', 'Only after dense baselines', 'No', 'Research'],
          ]}
        />
      </DomainBlock>

      <DomainBlock title="Information theory & statistics" subtitle="Honesty about uncertainty">
        <FieldTable
          headers={['Field', 'Meaning here', 'Online UI?', 'Offline?']}
          rows={[
            ['Entropy (bits)', 'How mixed the 4-way vote is', 'Yes', 'Yes'],
            ['Epistemic margin / confidence gap', 'Top1 − top2 mass', 'Yes', 'Yes'],
            ['Soft mass (0–1)', 'Relative share per head — not calibrated %', 'Yes', 'Yes'],
            ['Top-1, MRR, correct@2', 'Primary ranking metrics', 'No', 'Yes (ADOPT)'],
            ['Bootstrap / LOO / stratified CV', 'Tiny-N uncertainty', 'No', 'Yes'],
            ['ECE / reliability diagrams', 'Calibration quality', 'No', 'Yes'],
            ['Mutual information dense_j ↔ metre', 'Which slots inform labels', 'No', 'Yes (A06)'],
            ['χ² / Fisher on linkage × metre', 'Discrete bond association', 'No', 'Yes'],
            ['Head A/B table', 'Compare estimators fairly', 'No', 'Yes (A13)'],
          ]}
        />
      </DomainBlock>

      <DomainBlock title="Data mining & knowledge discovery" subtitle="Human-readable patterns">
        <FieldTable
          headers={['Method', 'Role', 'Online UI?', 'Offline?']}
          rows={[
            ['Association rules (Apriori-style)', 'Itemsets ⇒ metre', 'No', 'Yes (A08)'],
            ['Frequent Ner/Nirai motifs', 'Sequence vocabulary for later classical', 'No', 'Yes (A09)'],
            ['Contrast / emerging patterns', 'Venpaa vs Aciriyappaa differentiators', 'No', 'Yes'],
            ['Error subgroup discovery', 'Why ML fails', 'No', 'Yes'],
            ['Pattern cards (A12 freeze)', 'Per-metre top dense signals', 'Freeze date shown', 'Yes'],
            ['Disagreement mining', 'ML vs classical dual-compare buckets', 'Policy only', 'Yes (D03)'],
            ['Anomaly / isolation ideas', 'Suspect gold or parse', 'No', 'Yes (B)'],
          ]}
        />
      </DomainBlock>

      <DomainBlock title="Product wire fields you can see" subtitle="From parse_poem_wasm → metre_ml">
        <FieldTable
          headers={['JSON / UI field', 'Plain meaning', 'Live?']}
          rows={[
            ['metre_type', 'Best guess after hybrid/heuristic path', 'Yes'],
            ['metre_entropy_bits', 'How mixed? (entropy)', 'Yes'],
            ['metre_epistemic_margin', 'Lead over #2', 'Yes'],
            ['top_k_metre_hypotheses', 'Ranked families with soft mass', 'Yes (Structure)'],
            ['parse_features.dense[51]', 'Numeric summary of structure', 'Adapted'],
            ['metre_ml.head_votes[]', 'Per-head favourite + soft mass', 'Yes'],
            ['metre_ml.pattern_features[]', 'Top dense slots for this poem', 'Yes'],
            ['metre_ml.dual_truth.*', 'ML label ∥ classical flags + policy', 'Yes'],
            ['metre_ml.a12_freeze_date', 'Pattern freeze era', 'Yes if present'],
            ['metre_ml.honesty_label / uncertainty_blurb', 'Short honesty copy', 'Yes'],
            ['ml_only_classical_flags (reports)', 'Dual-compare bucket offline', 'No (reports)'],
          ]}
        />
      </DomainBlock>

      <InspirationDiagram />
    </div>
  )
}

function TrainingDocsTab() {
  return (
    <div className="flex flex-col gap-8" data-testid="dev-eval-training-docs">
      <section>
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          How we train (and what we do not claim)
        </h2>
        <ol className="text-[var(--sea-ink-soft)] list-decimal space-y-2 pl-5 text-base leading-relaxed">
          <li>
            <strong className="text-[var(--sea-ink)]">Pin meaning first (SOA S00–S03)</strong> — ontology of
            poem parts, exact meaning of each dense slot, anthology split (special_type gold vs variation
            stress), ledger fingerprint.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Freeze a baseline (A00)</strong> — dated top-1 / MRR on
            special_type. That freeze is ADOPT evidence, not the browser UI.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Fit small heads</strong> — dense logistic and prototypes on
            special_type (cached in WASM for live). Hybrid path can re-rank with shipped weights.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Discover, then freeze patterns (A05–A12)</strong> — before
            soft classical sketches ship as product.
          </li>
          <li>
            <strong className="text-[var(--sea-ink)]">Classical stays orthogonal (D)</strong> — flags and
            dual-compare reports never overwrite hybrid scores.
          </li>
        </ol>
        <LadderDiagram />
      </section>

      <section>
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          Online vs offline surfaces
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <PrincipleCard
            title="Online (browser WASM)"
            body="parse_poem_wasm → dense + head votes + entropy/margin + dual_truth. Product UI: Live, Structure, Developer Evaluation. Offline crates can be compiled out of product WASM."
          />
          <PrincipleCard
            title="Offline (cargo examples / reports)"
            body="Freeze metrics, PCA/MI/association, pattern cards, head A/B, dual-compare (e.g. ml_only_classical_flags), mismatch tables. Truth for ADOPT lives under data/training/reports."
          />
        </div>
      </section>

      <section>
        <h2 className="text-[var(--sea-ink)] mb-3 text-xl font-semibold tracking-tight">
          Repo documents (source of truth)
        </h2>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
          <li>
            <DocLink href={`${GITHUB_BLOB}/METRE_ML_BEGINNER_GUIDE.md`}>
              METRE_ML_BEGINNER_GUIDE.md
            </DocLink>
            <span className="text-muted-foreground"> — story, I/O, diagrams</span>
          </li>
          <li>
            <DocLink href={`${GITHUB_BLOB}/METRE_ML_METHODS_PORTFOLIO.md`}>
              METRE_ML_METHODS_PORTFOLIO.md
            </DocLink>
            <span className="text-muted-foreground"> — Tier A–D catalogue + ADOPT</span>
          </li>
          <li>
            <DocLink href={`${GITHUB_BLOB}/PARSE_FEATURES.md`}>PARSE_FEATURES.md</DocLink>
            <span className="text-muted-foreground"> — exact dense[51] layout</span>
          </li>
          <li>
            <DocLink href={`${GITHUB_BLOB}/METRE_PREDICTION.md`}>METRE_PREDICTION.md</DocLink>
            <span className="text-muted-foreground"> — hybrid / heuristic behaviour</span>
          </li>
          <li>
            <DocLink href={`${GITHUB_BLOB}/TRAINING_PROCESS.md`}>TRAINING_PROCESS.md</DocLink>
            <span className="text-muted-foreground"> — export & Monte Carlo</span>
          </li>
        </ul>
      </section>
    </div>
  )
}

function DomainBlock({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="text-[var(--sea-ink)] m-0 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground m-0 mt-0.5 mb-3 text-sm">{subtitle}</p>
      {children}
    </section>
  )
}

function FieldTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="border-rim/40 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[28rem] border-collapse text-left text-[0.78rem]">
        <thead>
          <tr className="bg-surface-2/40 border-rim/35 border-b">
            {headers.map((h) => (
              <th key={h} className="text-[var(--sea-ink)] px-2.5 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[var(--sea-ink-soft)]">
          {rows.map((row) => (
            <tr key={row.join('|')} className="border-rim/20 border-b last:border-0">
              {row.map((cell, i) => (
                <td key={`${row[0]}-${i}`} className="px-2.5 py-1.5 align-top leading-snug">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
        {firstPrinciple}
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

function ArchPipelineDiagram() {
  const stages = [
    { label: 'Tamil text', sub: 'input' },
    { label: 'Structure', sub: 'parse' },
    { label: '51 numbers', sub: 'features' },
    { label: 'Model votes', sub: 'guess' },
    { label: 'Lab tabs', sub: 'you' },
  ]
  return (
    <figure
      className="border-rim/40 bg-surface-2/15 overflow-x-auto rounded-xl border p-4"
      aria-label="Pipeline from poem text to UI"
    >
      <div className="flex min-w-[28rem] items-stretch gap-1.5">
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
          Light classical flags
        </span>
        <span className="text-muted-foreground text-[0.65rem]">sit beside votes — never rewrite them</span>
      </div>
      <figcaption className="text-muted-foreground mt-2 text-center text-[0.7rem]">
        Structure first, model votes second, classical flags in parallel.
      </figcaption>
    </figure>
  )
}

function InspirationDiagram() {
  const pillars = [
    { t: 'Ontology', d: 'Poem parts & bonds' },
    { t: 'Semantics', d: 'What each number means' },
    { t: 'Anthology', d: 'special_type gold' },
    { t: 'ML map', d: 'linear first' },
    { t: 'Control', d: 'measure ⟂ flags' },
  ]
  return (
    <figure
      className="border-rim/40 bg-surface-2/15 rounded-xl border p-4"
      aria-label="Inspiration sources for features and ML path"
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
        <p className="text-[var(--sea-ink)] m-0 text-sm font-semibold">51 numbers + multi-head product surface</p>
        <p className="text-muted-foreground m-0 mt-0.5 text-[0.68rem]">
          Fixed schema · special_type fit · dual-truth wire
        </p>
      </div>
    </figure>
  )
}

function LadderDiagram() {
  const rungs = [
    { id: 'S', label: 'Foundations', note: 'meaning pinned' },
    { id: 'A0', label: 'Baseline freeze', note: 'ADOPT grade' },
    { id: 'A2', label: 'Dual-truth wire', note: 'no score fusion' },
    { id: 'A3–4', label: 'Logistic + prototypes', note: 'live heads' },
    { id: 'A12', label: 'Pattern freeze', note: 'before classical' },
    { id: 'D', label: 'Classical dual path', note: 'flags only' },
  ]
  return (
    <figure
      className="border-rim/40 bg-surface-2/15 mt-4 rounded-xl border p-4"
      aria-label="Evidence ladder from foundations to classical dual path"
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
        <p className="text-[var(--sea-ink)] m-0 text-sm font-semibold">Offline</p>
        <ol className="text-[var(--sea-ink-soft)] mt-2 mb-0 list-decimal space-y-1 pl-4 text-[0.78rem] leading-snug">
          <li>Parse special_type anthology</li>
          <li>Fit heads & freeze metrics</li>
          <li>Write ADOPT reports</li>
        </ol>
      </div>
      <div className="border-rim/40 bg-surface-1/75 rounded-lg border px-3 py-3">
        <p className="text-[var(--sea-ink)] m-0 text-sm font-semibold">Live (browser)</p>
        <ol className="text-[var(--sea-ink-soft)] mt-2 mb-0 list-decimal space-y-1 pl-4 text-[0.78rem] leading-snug">
          <li>Your poem → parse in WASM</li>
          <li>Cached heads vote once warmed</li>
          <li>Show numbers in Developer Evaluation</li>
        </ol>
      </div>
    </figure>
  )
}
