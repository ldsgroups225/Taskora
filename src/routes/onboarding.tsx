import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Code2, LayoutPanelLeft } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { RoleContext } from '~/context/RoleContext'

import { useCurrentUser } from '~/hooks/useCurrentUser'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const { setRole } = React.use(RoleContext)
  const { isLoading } = useCurrentUser()
  const updateUserRole = useMutation(api.auth.updateUserRole)
  const navigate = useNavigate()

  const handleRoleSelect = async (selectedRole: 'dev' | 'manager') => {
    setRole(selectedRole)
    try {
      await updateUserRole({ role: selectedRole })
      await navigate({ to: '/' })
    }
    catch (err) {
      console.error('Failed to update role:', err)
      // Fallback to local navigation if mutation fails
      await navigate({ to: '/' })
    }
  }

  if (isLoading)
    return null

  return (
    <div className="flex grow items-center justify-center p-4 min-h-[500px] bg-slate-950">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">Welcome to Taskora</h1>
          <p className="text-slate-400 text-lg">Choose your primary perspective to get started.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="bg-slate-900/50 border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer group rounded-3xl overflow-hidden"
            onClick={async () => handleRoleSelect('dev')}
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-indigo-400" />
              </div>
              <CardTitle className="text-2xl text-white">Developer</CardTitle>
              <CardDescription>
                Focus on tasks, code, and flow. Zen Mode is designed for deep work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl">Select Dev Perspective</Button>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-900/50 border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer group rounded-3xl overflow-hidden"
            onClick={async () => handleRoleSelect('manager')}
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutPanelLeft className="w-6 h-6 text-indigo-400" />
              </div>
              <CardTitle className="text-2xl text-white">Manager</CardTitle>
              <CardDescription>
                High-level strategy, delivery metrics, and team orchestration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl">Select Manager Perspective</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
