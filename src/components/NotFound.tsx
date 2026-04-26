import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

export default function NotFound() {
  return (
    <main className="page-wrap flex min-h-[55vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="island-kicker mb-2">404</p>
      <h1 className="display-title text-[var(--sea-ink)] mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="text-[var(--sea-ink-soft)] mb-8 max-w-md text-base leading-relaxed">
        That path does not exist. Head back to the prosody lab or try the navigation above.
      </p>
      <Button asChild size="lg">
        <Link to="/">Back home</Link>
      </Button>
    </main>
  )
}
