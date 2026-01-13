import type { Id } from '../../convex/_generated/dataModel'
import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { IssueTypeIcon } from '~/components/IssueTypeIcon'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useProject } from '~/hooks/ui-hooks'
import { api } from '../../convex/_generated/api'

export function BacklogReviewPanel() {
  const { projectId } = useProject()
  const proposed = useQuery(
    api.reprioritization.getProposedRankings,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip',
  )

  if (!proposed || proposed.length === 0)
    return null

  return (
    <Card className="col-span-1 md:col-span-4 bg-linear-to-b from-primary/10 to-transparent border-primary/20 rounded-3xl overflow-hidden">
      <CardHeader className="p-6 border-b border-border/10 flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Backlog Refinement
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Gemini suggested new priorities for
            {' '}
            {proposed.length}
            {' '}
            items.
          </p>
        </div>
        <Link to="/settings/ai">
          <Button size="sm" className="bg-primary hover:bg-primary text-foreground rounded-xl text-xs font-bold gap-2">
            REVIEW & APPLY
            <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Header Row - Hidden on Mobile */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 border-b border-border/5 bg-card/2 font-bold text-muted-foreground uppercase tracking-tighter text-[10px]">
            <div className="col-span-1 text-center font-bold">Rank</div>
            <div className="col-span-4 font-bold">Issue</div>
            <div className="col-span-5 font-bold">Reasoning</div>
            <div className="col-span-2 text-right font-bold">Delta</div>
          </div>

          <div className="divide-y divide-white/5">
            {proposed.slice(0, 5).map((issue) => {
              const currentOrder = Math.floor(issue.order / 10) + 1
              const proposedRank = (issue.properties)?.proposedOrder
              const delta = currentOrder - proposedRank

              return (
                <div
                  key={issue._id}
                  className="group flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-6 py-5 md:py-4 hover:bg-card/2 transition-colors relative"
                >
                  {/* Rank Badge - Floats on mobile, Grid on Desktop */}
                  <div className="md:col-span-1 flex items-center justify-center">
                    <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-border shadow-inner">
                      {proposedRank}
                    </div>
                  </div>

                  {/* Issue Info */}
                  <div className="md:col-span-4 flex flex-col min-w-0">
                    <div className="flex items-start gap-3">
                      <IssueTypeIcon type={issue.type} className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground text-sm line-clamp-1">{issue.title}</span>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] h-3.5 px-1.5 py-0 border-border/30 text-muted-foreground uppercase">
                            {issue.priority}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] h-3.5 px-1.5 py-0 border-border/30 text-muted-foreground uppercase">
                            {issue.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reasoning - Fills width on mobile */}
                  <div className="md:col-span-5">
                    <div className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Reasoning</div>
                    <p className="text-muted-foreground text-xs italic leading-relaxed md:line-clamp-1 group-hover:line-clamp-none transition-all">
                      {(issue.properties)?.reprioritizationReason}
                    </p>
                  </div>

                  {/* Delta - Positioned for mobile visibility */}
                  <div className="md:col-span-2 flex items-center md:justify-end gap-2 md:gap-0">
                    <div className="md:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delta:</div>
                    <div className="text-right ml-auto md:ml-0">
                      {delta > 0
                        ? (
                            <span className="text-success font-bold text-sm">
                              +
                              {delta}
                              <span className="text-[10px] ml-1 uppercase opacity-70">pos</span>
                            </span>
                          )
                        : delta < 0
                          ? (
                              <span className="text-rose-400 font-bold text-sm">
                                {delta}
                                <span className="text-[10px] ml-1 uppercase opacity-70">pos</span>
                              </span>
                            )
                          : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {proposed.length > 5 && (
            <div className="p-4 text-center bg-card/2 border-t border-border/5">
              <Link to="/settings/ai" className="text-[10px] text-primary font-bold hover:underline uppercase tracking-widest flex items-center justify-center gap-2">
                <span>
                  View
                  {proposed.length - 5}
                  {' '}
                  more suggestions
                </span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
