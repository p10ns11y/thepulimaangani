import { createFileRoute } from '@tanstack/react-router'

import { DeveloperEvaluationGuide } from '#/components/prosody/DeveloperEvaluationGuide'

export const Route = createFileRoute('/developer-evaluation')({
  head: () => ({
    meta: [
      {
        title: 'Developer Evaluation · Metre ML — Thepulimaangani',
      },
      {
        name: 'description',
        content:
          'First-principles guide to metre ML: dense features, multi-head votes, entropy, dual-truth, and ADOPT — without classical over-claim.',
      },
    ],
  }),
  component: DeveloperEvaluationPage,
})

function DeveloperEvaluationPage() {
  return (
    <main className="page-wrap px-4 py-10 sm:py-14">
      <DeveloperEvaluationGuide />
    </main>
  )
}
