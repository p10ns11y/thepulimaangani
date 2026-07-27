import { createFileRoute } from '@tanstack/react-router'

import { DeveloperEvaluationGuide } from '#/components/prosody/DeveloperEvaluationGuide'
import { validateDevEvalSearch } from '#/lib/devEvalTabs'
import { buildSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/developer-evaluation')({
  validateSearch: validateDevEvalSearch,
  head: ({ match }) => ({
    meta: buildSeoMeta({
      page: 'developer-evaluation',
      tab: match.search.tab,
    }),
  }),
  component: DeveloperEvaluationPage,
})

function DeveloperEvaluationPage() {
  const { tab } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <main className="page-wrap px-4 py-10 sm:py-14">
      <DeveloperEvaluationGuide
        tab={tab}
        onTabChange={(next) => {
          void navigate({
            to: '/developer-evaluation',
            search: { tab: next },
            // Push so browser Back returns to the previous tab (history-friendly).
            replace: false,
          })
        }}
      />
    </main>
  )
}
