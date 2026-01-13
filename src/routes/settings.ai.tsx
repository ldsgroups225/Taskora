import type { Id } from '../../convex/_generated/dataModel'
import { createFileRoute } from '@tanstack/react-router'
import { useAction, useMutation, useQuery } from 'convex/react'
import { AlertCircle, Check, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { useProject } from '~/hooks/ui-hooks'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/settings/ai')({
  component: AIGroomingSettings,
})

function AIGroomingSettings() {
  const { projectId } = useProject()
  const proposed = useQuery(api.reprioritization.getProposedRankings, projectId ? { projectId: projectId as Id<'projects'> } : 'skip')
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
          <h1 className="text-2xl font-bold text-foreground">AI Backlog Grooming</h1>
          <p className="text-muted-foreground">Review and apply AI-suggested priority rankings.</p>
        </div>
        <Button
          onClick={handleRun}
          className="bg-primary hover:bg-primary text-foreground gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Run AI Analysis
        </Button>
      </div>

      <Card className="bg-card/5 border-border/10 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/5 bg-background/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Proposed Rankings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                AI suggested order based on priority, age, and complexity.
              </CardDescription>
            </div>
            {proposed && proposed.length > 0 && (
              <Button
                onClick={handleApply}
                className="bg-success hover:bg-success text-foreground gap-2"
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
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p>Fetching proposed rankings...</p>
                </div>
              )
            : proposed.length === 0
              ? (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <p>No proposed rankings found. Run analysis to get suggestions.</p>
                  </div>
                )
              : (
                  <div className="divide-y divide-white/5">
                    {proposed.map(issue => (
                      <div key={issue._id} className="p-4 flex items-center gap-4 hover:bg-card/5 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-border">
                          {issue.properties?.proposedOrder}
                        </div>
                        <div className="grow min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground truncate">{issue.title}</h4>
                            <Badge variant="outline" className="text-[10px] bg-background/50 text-muted-foreground uppercase">
                              {issue.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "
                            {issue.properties?.reprioritizationReason}
                            "
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Current Order</p>
                          <p className="text-sm font-mono text-muted-foreground">{issue.order}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
        </CardContent>
      </Card>

      <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex gap-3 text-sm text-warning/80">
        <AlertCircle className="w-5 h-5 shrink-0 text-warning" />
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
