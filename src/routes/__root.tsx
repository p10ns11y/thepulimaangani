import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppActorProvider } from '#/components/AppActorProvider'
import { SHELL_LOOK_INIT_SCRIPT } from '#/lib/legacyLookStorage'
import { RedpillTamilMatrixBackdrop } from '#/components/RedpillTamilMatrixBackdrop'

import Footer from '../components/Footer'
import Header from '../components/Header'
import NotFound from '../components/NotFound'

import appCss from '../styles.css?url'


export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Thepulimaangani',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SHELL_LOOK_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <AppActorProvider>
          <RedpillTamilMatrixBackdrop />
          <div className="relative z-10 min-w-0">
            <Header />
            {children}
            <Footer />
          </div>
          <Scripts />
        </AppActorProvider>
      </body>
    </html>
  )
}
