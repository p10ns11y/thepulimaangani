import { createFileRoute } from '@tanstack/react-router'

import { ProsodyLab } from '#/components/prosody/ProsodyLab'
import { buildSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: buildSeoMeta({ page: 'home' }),
  }),
  component: ProsodyLab,
})
