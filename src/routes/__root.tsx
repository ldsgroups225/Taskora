/// <reference types="vite/client" />
import type { QueryClient } from '@tanstack/react-query'
import type { UserRole } from '~/context/RoleContext'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production'
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Code2, LayoutPanelLeft, Rocket } from 'lucide-react'
import * as React from 'react'
import { CommandMenu } from '~/components/CommandMenu'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { Toaster } from '~/components/ui/sonner'
import { RoleContext } from '~/context/RoleContext'
import { cn } from '~/lib/utils'
import appCss from '~/styles/app.css?url'

import { seo } from '~/utils/seo'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'Taskora | Agentic Project Orchestration',
        description: 'Autonomously managing backlogs and predicting bottlenecks for high-growth startups.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: props => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const [role, setRole] = React.useState<UserRole>('dev')

  return (
    <RoleContext value={{ role, setRole }}>
      <RootDocument role={role} setRole={setRole}>
        <Outlet />
      </RootDocument>
    </RoleContext>
  )
}

function RootDocument({
  children,
  role,
  setRole,
}: {
  children: React.ReactNode
  role?: UserRole
  setRole?: (role: UserRole) => void
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased selection:bg-indigo-500/30">
        <div className="h-screen flex flex-col min-h-0 bg-slate-950 text-slate-200">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
            <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 group shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white uppercase italic">Taskora</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10 shrink-0">
                  <button
                    onClick={() => setRole?.('dev')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                      role === 'dev'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white',
                    )}
                  >
                    <Code2 className="w-4 h-4" />
                    Zen Mode
                  </button>
                  <button
                    onClick={() => setRole?.('manager')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                      role === 'manager'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white',
                    )}
                  >
                    <LayoutPanelLeft className="w-4 h-4" />
                    War Room
                  </button>
                </nav>
              </div>

              <div className="hidden sm:flex items-center gap-4 grow justify-center max-w-md">
                <CommandMenu />
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <LoadingIndicator />
                <div className="sm:hidden">
                  <CommandMenu />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold">JD</span>
                </div>
              </div>
            </div>
          </header>

          <main className="grow min-h-0 h-full flex flex-col">
            {children}
            <Toaster position="bottom-right" />
          </main>
        </div>
        <ReactQueryDevtools />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}

function LoadingIndicator() {
  const isLoading = useRouterState({ select: s => s.isLoading })
  return (
    <div className={cn(
      'h-8 flex items-center transition-all duration-300',
      isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
    )}
    >
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
