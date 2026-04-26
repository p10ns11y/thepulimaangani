import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppActorProvider } from '#/components/AppActorProvider'
import { RedfillTamilMatrixBackdrop } from '#/components/RedfillTamilMatrixBackdrop'

import Footer from '../components/Footer'
import Header from '../components/Header'
import NotFound from '../components/NotFound'

import appCss from '../styles.css?url'

/** Sets `data-look` + `color-scheme` from localStorage before paint; migrates legacy `fantasy` → `redfill`. */
const SHELL_INIT_SCRIPT = `(function(){try{var r=document.documentElement,l=localStorage.getItem('look'),v; if(l==='real')v='real';else if(l==='redfill'||l==='fantasy'){v=l==='fantasy'?'redfill':l; if(l==='fantasy') try{localStorage.setItem('look','redfill');}catch(e){}}else v='real'; r.dataset.look=v;r.style.colorScheme=v==='redfill'?'dark':'light';}catch(e){}})();`

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
          <RedfillTamilMatrixBackdrop />
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
