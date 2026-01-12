import type { Id } from '../../convex/_generated/dataModel'
import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { IssueTypeIcon } from '~/components/IssueTypeIcon'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { useProject } from '~/context/ProjectContext'
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/5 bg-card/2">
                <th className="px-6 py-3 font-bold text-muted-foreground uppercase tracking-tighter w-16 text-center">Rank</th>
                <th className="px-6 py-3 font-bold text-muted-foreground uppercase tracking-tighter">Issue</th>
                <th className="px-6 py-3 font-bold text-muted-foreground uppercase tracking-tighter">Reasoning</th>
                <th className="px-6 py-3 font-bold text-muted-foreground uppercase tracking-tighter text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {proposed.slice(0, 5).map((issue) => {
                const currentOrder = Math.floor(issue.order / 10) + 1 // Rough estimate of current rank
                const proposedRank = (issue.properties)?.proposedOrder
                const delta = currentOrder - proposedRank

                return (
                  <tr key={issue._id} className="group hover:bg-card/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-border mx-auto">
                        {proposedRank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <IssueTypeIcon type={issue.type} className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-foreground line-clamp-1">{issue.title}</span>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] h-3.5 px-1 py-0 border-border text-muted-foreground">
                              {issue.priority}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] h-3.5 px-1 py-0 border-border text-muted-foreground">
                              {issue.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-muted-foreground italic line-clamp-1 group-hover:line-clamp-none transition-all">
                        {(issue.properties)?.reprioritizationReason}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {delta > 0
                        ? (
                            <span className="text-success font-bold">
                              +
                              {delta}
                              {' '}
                              positions
                            </span>
                          )
                        : delta < 0
                          ? (
                              <span className="text-rose-400 font-bold">
                                {delta}
                                {' '}
                                positions
                              </span>
                            )
                          : (
                              <span className="text-muted-foreground">—</span>
                            )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {proposed.length > 5 && (
            <div className="p-3 text-center bg-card/2 border-t border-border/5">
              <Link to="/settings/ai" className="text-[10px] text-primary font-bold hover:underline uppercase tracking-widest">
                View
                {' '}
                {proposed.length - 5}
                {' '}
                more suggestions
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
