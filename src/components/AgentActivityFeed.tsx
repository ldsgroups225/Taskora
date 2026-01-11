import type { Id } from '../../convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { formatDistanceToNow } from 'date-fns'
import { Bot, Sparkles, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'
import { useProject } from '~/context/ProjectContext'
import { api } from '../../convex/_generated/api'

export function AgentActivityFeed() {
  const { projectId } = useProject()
  const logs = useQuery(api.agents.getAgentLogs, { projectId: projectId as Id<'projects'> | undefined })

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl h-full flex flex-col">
      <CardHeader className="py-4 border-b border-white/5 bg-slate-900/50">
        <CardTitle className="text-sm font-bold text-indigo-300 flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Agent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 grow overflow-hidden">
        <ScrollArea className="h-[300px]">
          <div className="p-4 space-y-4">
            {logs === undefined
              ? (
                  <div className="text-center text-xs text-slate-500 py-8">Loading logs...</div>
                )
              : logs.length === 0
                ? (
                    <div className="text-center text-xs text-slate-500 py-8">No recent activity</div>
                  )
                : (
                    logs.map(log => (
                      <div key={log._id} className="flex gap-3 text-xs group">
                        <div className="mt-0.5 relative shrink-0">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-indigo-500/50 transition-colors">
                            {log.status === 'success'
                              ? (
                                  <Sparkles className="w-3 h-3 text-purple-400" />
                                )
                              : log.status === 'failed'
                                ? (
                                    <XCircle className="w-3 h-3 text-red-400" />
                                  )
                                : (
                                    <Bot className="w-3 h-3 text-slate-400" />
                                  )}
                          </div>
                        </div>
                        <div className="grow space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-300 capitalize truncate">
                              {log.action.replace('_', ' ')}
                            </span>
                            <span className="text-slate-500 text-[10px] whitespace-nowrap">
                              {formatDistanceToNow(log._creationTime, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-slate-400 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                            {log.result}
                          </p>
                          {log.error && (
                            <p className="text-red-400 font-mono bg-red-900/10 px-2 py-1 rounded">
                              Error:
                              {' '}
                              {log.error}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
