import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppActorProvider } from '#/components/AppActorProvider'
import { AppShellSync } from '#/components/AppShellSync'

import Footer from '../components/Footer'
import Header from '../components/Header'
import NotFound from '../components/NotFound'

import appCss from '../styles.css?url'

/** Sets `data-look` + `color-scheme` from localStorage before paint (`real` | `fantasy` only). */
const SHELL_INIT_SCRIPT = `(function(){try{var r=document.documentElement;var l=localStorage.getItem('look');var v=(l==='real'||l==='fantasy')?l:'real';r.dataset.look=v;r.style.colorScheme=v==='fantasy'?'dark':'light';}catch(e){}})();`

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
        <script dangerouslySetInnerHTML={{ __html: SHELL_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <AppActorProvider>
          <AppShellSync />
          <Header />
          {children}
          <Footer />
          <Scripts />
        </AppActorProvider>
      </body>
    </html>
  )
}
