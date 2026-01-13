import type { Id } from '../../convex/_generated/dataModel'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpRight,
  Target,
  Terminal,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import { useProject } from '~/context/ProjectContext'
import { useDeliverables } from '~/hooks/useDeliverables'
import { useProjectMetrics } from '~/hooks/useProjectMetrics'
import { AgentActivityFeed } from './AgentActivityFeed'
import { BacklogReviewPanel } from './BacklogReviewPanel'
import { IssueTypeIcon } from './IssueTypeIcon'

export function WarRoom() {
  const { projectId } = useProject()
  const { metrics, isLoading: isLoadingMetrics } = useProjectMetrics(projectId as Id<'projects'>)
  const { deliverables, isLoading: isLoadingDeliverables } = useDeliverables(projectId as Id<'projects'>)

  const handleCopyPrompt = async (e: React.MouseEvent, prompt?: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!prompt) {
      toast.info('Prompt is being generated, please wait...')
      return
    }

    try {
      await navigator.clipboard.writeText(prompt)
      toast.success('Developer prompt copied', {
        icon: <Terminal className="w-4 h-4 text-primary" />,
      })
    }
    catch {
      toast.error('Failed to copy prompt')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="p-4 md:p-8 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-3xl font-bold text-foreground tracking-tight leading-none">Project Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Taskora Intelligent Insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 border-success/20 text-success px-3 py-1 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse mr-2" />
            ON TRACK
          </Badge>
          <Badge variant="secondary" className="bg-card/5 border-border/10 text-foreground px-3 py-1 font-mono">
            V2.5.0-ALPHA
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {/* Bento Stats */}
        <Card className="col-span-1 md:col-span-2 bg-linear-to-br from-primary/10 to-accent/10 border-border/10 rounded-3xl relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <Zap className="w-24 h-24 text-primary" />
            </div>
            <div className="relative">
              <p className="text-muted-foreground text-sm font-medium">Velocity Score</p>
              {isLoadingMetrics
                ? (
                    <Skeleton className="h-10 w-24 mt-1 bg-card/5" />
                  )
                : (
                    <h2 className="text-4xl font-bold text-foreground mt-1">{metrics?.velocity ?? 0}</h2>
                  )}
              <div className="flex items-center gap-1.5 mt-2 text-success text-sm font-bold">
                <TrendingUp className="w-4 h-4" />
                Live from Convex
              </div>
              <div className="mt-8 flex gap-2 items-end h-16">
                {(metrics?.velocityHistory || [0, 0, 0, 0, 0, 0, 0]).map((v, i) => {
                  const maxVelocity = Math.max(...(metrics?.velocityHistory || [10])) || 10
                  const height = Math.max((v / maxVelocity) * 100, 10)
                  return (
                    <div key={i} className="grow h-full bg-card/10 rounded items-end flex overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="w-full bg-primary/40 group-hover:bg-primary/60 transition-colors"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/5 border-border/10 rounded-3xl hover:bg-card/8 transition-colors cursor-pointer group">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">Total Risks</p>
            {isLoadingMetrics
              ? (
                  <Skeleton className="h-9 w-12 mt-1 bg-card/5" />
                )
              : (
                  <h2 className="text-3xl font-bold text-foreground mt-1">{metrics?.riskCount ?? 0}</h2>
                )}
            <p className="text-muted-foreground text-xs mt-2 font-mono">Predicted by Gemini AI</p>
          </CardContent>
        </Card>

        <div className="md:col-span-1 md:row-span-2">
          <AgentActivityFeed />
        </div>

        {/* Deliverables Grid */}
        <Card className="col-span-1 md:col-span-3 bg-card/5 border-border/10 rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="p-6 border-b border-border/10 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              High Priority Deliverables
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary text-xs font-bold hover:bg-primary/10 flex items-center gap-1 p-0 px-2">
              VIEW ROADMAP
              {' '}
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-white/5 overflow-y-auto">
            {isLoadingDeliverables
              ? (
                  ['skeleton-1', 'skeleton-2', 'skeleton-3'].map(key => (
                    <div key={key} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-8 h-8 rounded-lg bg-card/5" />
                        <div>
                          <Skeleton className="h-4 w-32 bg-card/5" />
                          <Skeleton className="h-3 w-24 mt-1 bg-card/5" />
                        </div>
                      </div>
                      <Skeleton className="w-24 h-1.5 bg-card/5" />
                    </div>
                  ))
                )
              : deliverables && deliverables.length > 0
                ? (
                    (deliverables as { _id: string, title: string, type: string, priority: string, status: string, generatedPrompt?: string }[]).map(item => (
                      <div key={item._id} className="group px-6 py-4 flex items-center justify-between hover:bg-card/2 transition-colors">
                        <div className="flex items-center gap-4 min-w-0 grow">
                          <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <IssueTypeIcon type={item.type} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 grow">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-base md:text-sm font-bold text-foreground tracking-tight line-clamp-1">{item.title}</p>
                              {item.generatedPrompt && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0 h-9 w-9 md:h-8 md:w-8 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                  onClick={async e => handleCopyPrompt(e, item.generatedPrompt)}
                                  title="Copy Developer Prompt"
                                >
                                  <Terminal className="w-4 h-4 md:w-3.5 md:h-3.5" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm md:text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">
                              {item.priority}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 sm:ml-4">
                          <div className="hidden sm:flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-warning" />
                            <span className="text-xs font-bold text-muted-foreground">AI Tracked</span>
                          </div>
                          <Progress value={item.status === 'in_progress' ? 40 : item.status === 'in_review' ? 80 : 10} className="w-24 h-1.5" />
                        </div>
                      </div>
                    ))
                  )
                : (
                    <div className="px-6 py-12 text-center text-muted-foreground">
                      <p className="text-sm">No high-priority deliverables at the moment.</p>
                    </div>
                  )}
          </CardContent>
        </Card>

        <Card className="bg-primary rounded-3xl p-6 text-foreground border-0 flex flex-col justify-between shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="relative">
            <h3 className="font-bold text-lg leading-tight">Productivity</h3>
            {isLoadingMetrics
              ? (
                  <Skeleton className="h-6 w-16 mt-2 bg-card/20" />
                )
              : (
                  <p className="text-primary text-sm mt-2 font-medium bg-card/10 w-fit px-2 py-0.5 rounded">
                    Score:
                    {' '}
                    {metrics?.productivity ?? 0}
                    %
                  </p>
                )}
          </div>
          <Button variant="secondary" className="mt-8 bg-card text-primary hover:bg-primary rounded-xl text-xs font-bold transition-colors z-10 w-full">
            VIEW ANALYTICS
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <BacklogReviewPanel />
      </div>
    </motion.div>
  )
}
