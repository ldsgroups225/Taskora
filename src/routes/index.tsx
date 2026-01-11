import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { WarRoom } from '~/components/WarRoom'
import { ZenMode } from '~/components/ZenMode'
import { useViewMode } from '~/context/ViewModeContext'
import { useCurrentUser } from '~/hooks/useCurrentUser'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { viewMode } = useViewMode()
  const { user, isLoading, isAuthenticated } = useCurrentUser()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.role) {
      void navigate({ to: '/onboarding' })
    }
  }, [user, isLoading, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="grow animate-pulse bg-background/20" />
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="grow flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tighter text-foreground uppercase italic">
          Taskora
        </h1>
        <p className="text-muted-foreground text-xl max-w-md">
          The autonomous AI project orchestrator for high-growth startups.
        </p>
        <div className="flex gap-4">
          <button
            onClick={async () => navigate({ to: '/sign-in' })}
            className="px-8 py-3 bg-primary hover:bg-primary text-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all"
          >
            Start Orchestrating
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grow flex flex-col min-h-0 overflow-y-auto">
      <AnimatePresence mode="wait">
        {viewMode === 'zen'
          ? (
              <ZenMode key="zen" />
            )
          : (
              <WarRoom key="war" />
            )}
      </AnimatePresence>
    </div>
  )
}
