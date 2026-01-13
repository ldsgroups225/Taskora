/// <reference types="vite/client" />
import type { QueryClient } from '@tanstack/react-query'
import type { ConvexReactClient } from 'convex/react'
import type { UserRole } from '~/context/RoleContext'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from '@clerk/clerk-react'

import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'

import { useMutation } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { Rocket, Settings as SettingsIcon } from 'lucide-react'
import * as React from 'react'
import { CommandMenu } from '~/components/CommandMenu'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { ProjectSelector } from '~/components/ProjectSelector'
import { ThemeProvider } from '~/components/ThemeProvider'
import { ThemeToggle } from '~/components/ThemeToggle'
import { Toaster } from '~/components/ui/sonner'
import { TooltipProvider } from '~/components/ui/tooltip'
import { ViewModeToggle } from '~/components/ViewModeToggle'
import { RoleContext } from '~/context/RoleContext'
import { ProjectProvider, useProject, useViewMode, ViewModeProvider } from '~/hooks/ui-hooks'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { cn } from '~/lib/utils'
import { seo } from '~/utils/seo'
import { api } from '../../convex/_generated/api'

import '~/styles/app.css'

const ReactQueryDevtools
  = import.meta.env.PROD
    ? () => null
    : React.lazy(async () =>
        import('@tanstack/react-query-devtools').then(res => ({
          default: res.ReactQueryDevtools,
        })),
      )

const TanStackRouterDevtools
  = import.meta.env.PROD
    ? () => null
    : React.lazy(async () =>
        import('@tanstack/react-router-devtools').then(res => ({
          default: res.TanStackRouterDevtools,
        })),
      )

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
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
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased selection:bg-primary/30">
        <RootProviders>
          {children}
        </RootProviders>
        <Scripts />
      </body>
    </html>
  )
}

function RootProviders({ children }: { children: React.ReactNode }) {
  const { convexClient } = Route.useRouteContext()
  const navigate = useNavigate()
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      routerPush={async to => navigate({ to })}
      routerReplace={async to => navigate({ to, replace: true })}
    >
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        <RootComponentInner>
          {children}
        </RootComponentInner>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

function RootComponentInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, isConvexAuthenticated } = useCurrentUser()
  const [manualRole, setManualRole] = React.useState<UserRole | null>(null)
  const navigate = useNavigate()
  const path = useRouterState({ select: s => s.location.pathname })
  const storeUser = useMutation(api.auth.storeUser)

  const role = manualRole ?? (user?.role as UserRole | undefined) ?? 'dev'

  // Sync user to database on first successful login
  React.useEffect(() => {
    if (isConvexAuthenticated && !user && !isLoading) {
      void storeUser()
    }
  }, [isConvexAuthenticated, user, isLoading, storeUser])

  React.useEffect(() => {
    if (isAuthenticated && user && !isLoading && !user.role && path !== '/onboarding') {
      void navigate({ to: '/onboarding' })
    }
  }, [user, isLoading, isAuthenticated, path, navigate])

  const setRole = React.useCallback((newRole: UserRole) => {
    setManualRole(newRole)
  }, [])

  return (
    <ProjectProvider>
      <ViewModeProvider>
        <RoleContext value={{ role, setRole }}>
          <ViewModeSync role={role} />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RootLayout>
              {children}
            </RootLayout>
          </ThemeProvider>
        </RoleContext>
      </ViewModeProvider>
    </ProjectProvider>
  )
}

function ViewModeSync({ role }: { role: UserRole }) {
  const { setViewMode } = useViewMode()

  // Logic 9.2: Set default view mode based on role
  React.useEffect(() => {
    if (role === 'manager') {
      setViewMode('warroom')
    }
    else {
      setViewMode('zen')
    }
  }, [role, setViewMode])

  return null
}

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col min-h-0 bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/5 bg-background/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-2 md:gap-4 overflow-x-hidden">
            <div className="flex items-center gap-2 md:gap-8 shrink-0">
              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <Rocket className="w-5 h-5 text-foreground" />
                </div>
                <span className="hidden lg:inline font-bold text-xl tracking-tight text-foreground uppercase italic">Taskora</span>
              </Link>

              <ViewModeToggle />
            </div>

            <div className="hidden sm:flex items-center gap-4 grow justify-center max-w-md">
              <CommandMenu />
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <ProjectSelectorWrapper />
              <LoadingIndicator />
              <div className="sm:hidden -ml-2">
                <CommandMenu />
              </div>
              <div className="flex items-center gap-1.5 md:gap-3">
                <ThemeToggle />
                <Link
                  to="/settings/projects"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-card/5 rounded-xl transition-all hidden xs:flex"
                  title="Settings"
                >
                  <SettingsIcon className="w-5 h-5" />
                </Link>
                <SignedIn>
                  <div className="scale-90 md:scale-100">
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox: 'w-8 h-8 rounded-full border border-border/10',
                        },
                      }}
                    />
                  </div>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>
        </header>

        <main className="grow min-h-0 h-full flex flex-col">
          {children}
          <Toaster position="bottom-center" />
        </main>
      </div>

      <React.Suspense fallback={null}>
        <ReactQueryDevtools />
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>
    </TooltipProvider>
  )
}

function ProjectSelectorWrapper() {
  const { projectId, setProjectId } = useProject()
  return (
    <ProjectSelector
      selectedId={projectId || undefined}
      onSelect={setProjectId}
      className="max-w-[150px] md:max-w-none"
    />
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
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
