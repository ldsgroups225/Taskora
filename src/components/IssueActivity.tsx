import type { Id } from '../../convex/_generated/dataModel'
import { useSuspenseQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, ArrowRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { issueQueries } from '~/queries'

interface IssueActivityProps {
  issueId: Id<'issues'>
}

interface EnrichedActivityLog {
  _id: Id<'activityLog'>
  _creationTime: number
  issueId: Id<'issues'>
  userId: Id<'users'>
  action: string
  oldValue?: string
  newValue?: string
  userName: string
  userAvatar?: string
}

export function IssueActivity({ issueId }: IssueActivityProps) {
  const { data: logs } = useSuspenseQuery(issueQueries.activity(issueId)) as { data: EnrichedActivityLog[] }

  const getActionDescription = (log: EnrichedActivityLog) => {
    switch (log.action) {
      case 'status_change':
        return (
          <span className="flex items-center gap-1.5 flex-wrap">
            changed status from
            <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground border border-border/5 font-mono text-[10px]">
              {log.oldValue}
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="px-1.5 py-0.5 rounded bg-primary/30 text-primary border border-primary/20 font-mono text-[10px]">
              {log.newValue}
            </span>
          </span>
        )
      case 'priority_change':
        return (
          <span className="flex items-center gap-1.5 flex-wrap">
            changed priority from
            <span className="font-bold text-muted-foreground capitalize">{log.oldValue}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="font-bold text-primary capitalize">{log.newValue}</span>
          </span>
        )
      case 'assignee_change':
        return (
          <span>
            assigned this issue to
            {' '}
            <span className="font-bold text-primary">{log.newValue === 'unassigned' ? 'Nobody' : log.newValue}</span>
          </span>
        )
      case 'title_change':
        return (
          <span>
            renamed the issue
          </span>
        )
      default:
        return log.action
    }
  }

  return (
    <div className="space-y-6 mt-12 bg-card/2 border border-border/5 rounded-3xl p-6">
      <div className="flex items-center gap-2 border-b border-border/5 pb-2 mb-4">
        <Activity className="w-4 h-4 text-success" />
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">History & Activity</h3>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-card/10 before:to-transparent">
        {logs.map((log, idx: number) => (
          <motion.div
            key={log._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative flex items-start gap-4"
          >
            <div className="flex items-center justify-center bg-background ring-4 ring-ring z-10 shrink-0 mt-0.5">
              <Avatar className="w-8 h-8 ring-1 ring-white/10">
                <AvatarImage src={log.userAvatar} />
                <AvatarFallback className="bg-secondary text-muted-foreground text-[10px]">
                  {log.userName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm text-muted-foreground leading-relaxed font-medium">
                <span className="font-bold text-foreground mr-1">{log.userName}</span>
                {getActionDescription(log)}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-tighter">
                {new Date(log._creationTime).toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}

        {logs.length === 0 && (
          <div className="pl-10 text-muted-foreground italic text-sm py-4">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
