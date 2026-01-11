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
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5 font-mono text-[10px]">
              {log.oldValue}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="px-1.5 py-0.5 rounded bg-indigo-900/30 text-indigo-300 border border-indigo-500/20 font-mono text-[10px]">
              {log.newValue}
            </span>
          </span>
        )
      case 'priority_change':
        return (
          <span className="flex items-center gap-1.5 flex-wrap">
            changed priority from
            <span className="font-bold text-slate-400 capitalize">{log.oldValue}</span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="font-bold text-indigo-400 capitalize">{log.newValue}</span>
          </span>
        )
      case 'assignee_change':
        return (
          <span>
            assigned this issue to
            {' '}
            <span className="font-bold text-indigo-400">{log.newValue === 'unassigned' ? 'Nobody' : log.newValue}</span>
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
    <div className="space-y-6 mt-12 bg-white/2 border border-white/5 rounded-3xl p-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
        <Activity className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">History & Activity</h3>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-white/10 before:to-transparent">
        {logs.map((log, idx: number) => (
          <motion.div
            key={log._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative flex items-start gap-4"
          >
            <div className="flex items-center justify-center bg-slate-950 ring-4 ring-slate-950 z-10 shrink-0 mt-0.5">
              <Avatar className="w-8 h-8 ring-1 ring-white/10">
                <AvatarImage src={log.userAvatar} />
                <AvatarFallback className="bg-slate-800 text-slate-400 text-[10px]">
                  {log.userName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-400 leading-relaxed font-medium">
                <span className="font-bold text-slate-200 mr-1">{log.userName}</span>
                {getActionDescription(log)}
              </div>
              <div className="text-[10px] text-slate-600 font-mono mt-1 uppercase tracking-tighter">
                {new Date(log._creationTime).toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}

        {logs.length === 0 && (
          <div className="pl-10 text-slate-600 italic text-sm py-4">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}
