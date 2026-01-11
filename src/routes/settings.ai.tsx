import type { Id } from '../../convex/_generated/dataModel'
import { createFileRoute } from '@tanstack/react-router'
import { useAction, useMutation, useQuery } from 'convex/react'
import { AlertCircle, Check, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { useProject } from '~/context/ProjectContext'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/settings/ai')({
  component: AIGroomingSettings,
})

function AIGroomingSettings() {
  const { projectId } = useProject()
  const proposed = useQuery(api.reprioritization.getProposedRankings, { projectId: projectId as Id<'projects'> })
  const runGrooming = useAction(api.reprioritization.triggerReprioritization)
  const applyRankings = useMutation(api.reprioritization.applyProposedRankings)

  const handleRun = async () => {
    if (!projectId)
      return
    toast.promise(runGrooming({ projectId: projectId as Id<'projects'> }), {
      loading: 'AI is analyzing your backlog...',
      success: 'AI has proposed a new priority ranking!',
      error: 'Failed to run AI grooming',
    })
  }

  const handleApply = async () => {
    if (!projectId)
      return
    toast.promise(applyRankings({ projectId: projectId as Id<'projects'> }), {
      loading: 'Applying new priorities...',
      success: data => `Backlog re-ordered! ${data?.updatedCount} issues updated.`,
      error: 'Failed to apply rankings',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Backlog Grooming</h1>
          <p className="text-slate-400">Review and apply AI-suggested priority rankings.</p>
        </div>
        <Button
          onClick={handleRun}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Run AI Analysis
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Proposed Rankings
              </CardTitle>
              <CardDescription className="text-slate-500">
                AI suggested order based on priority, age, and complexity.
              </CardDescription>
            </div>
            {proposed && proposed.length > 0 && (
              <Button
                onClick={handleApply}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Check className="w-4 h-4" />
                Apply All Changes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!proposed
            ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p>Fetching proposed rankings...</p>
                </div>
              )
            : proposed.length === 0
              ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <p>No proposed rankings found. Run analysis to get suggestions.</p>
                  </div>
                )
              : (
                  <div className="divide-y divide-white/5">
                    {proposed.map(issue => (
                      <div key={issue._id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
                          {issue.properties?.proposedOrder}
                        </div>
                        <div className="grow min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white truncate">{issue.title}</h4>
                            <Badge variant="outline" className="text-[10px] bg-slate-900/50 text-slate-400 uppercase">
                              {issue.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 italic">
                            "
                            {(issue.properties).reprioritizationReason}
                            "
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Order</p>
                          <p className="text-sm font-mono text-slate-400">{issue.order}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
        </CardContent>
      </Card>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-200/80">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
        <p>
          <strong>Warning:</strong>
          {' '}
          Applying rankings will overwrite the manual 'order' field for these issues.
          This process is permanent but can be re-run if needed.
        </p>
      </div>
    </div>
  )
}
