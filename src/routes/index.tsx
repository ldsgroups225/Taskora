import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { WarRoom } from '~/components/WarRoom'
import { ZenMode } from '~/components/ZenMode'
import { RoleContext } from '~/context/RoleContext'
import { useCurrentUser } from '~/hooks/useCurrentUser'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { role, setRole } = React.use(RoleContext)
  const { user, isLoading, isAuthenticated } = useCurrentUser()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user && !user.role) {
      void navigate({ to: '/onboarding' })
    }
    if (!isLoading && user?.role && user.role !== role) {
      setRole(user.role as any)
    }
  }, [user, isLoading, isAuthenticated, role, setRole, navigate])

  if (isLoading) {
    return (
      <div className="grow animate-pulse bg-slate-900/20" />
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="grow flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tighter text-white uppercase italic">
          Taskora
        </h1>
        <p className="text-slate-400 text-xl max-w-md">
          The autonomous AI project orchestrator for high-growth startups.
        </p>
        <div className="flex gap-4">
          <button
            onClick={async () => navigate({ to: '/sign-in' })}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
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
        {role === 'dev'
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
