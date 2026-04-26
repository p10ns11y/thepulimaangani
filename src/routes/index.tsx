import { createFileRoute } from '@tanstack/react-router'

import { ProsodyLab } from '#/components/prosody/ProsodyLab'

export const Route = createFileRoute('/')({ component: ProsodyLab })
