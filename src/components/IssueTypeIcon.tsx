import {
  Book,
  Bug,
  CheckCircle2,
  Crown,
  GitCommit,
  Target,
} from 'lucide-react'
import { cn } from '~/lib/utils'

export type IssueType = 'initiative' | 'epic' | 'story' | 'task' | 'bug' | 'subtask' | string

interface IssueTypeIconProps {
  type: IssueType
  className?: string
}

export function IssueTypeIcon({ type, className }: IssueTypeIconProps) {
  switch (type) {
    case 'initiative':
      return <Target className={cn('text-indigo-500', className)} aria-label="Initiative" />
    case 'epic':
      return <Crown className={cn('text-purple-500', className)} aria-label="Epic" />
    case 'story':
      return <Book className={cn('text-emerald-500', className)} aria-label="Story" />
    case 'task':
      return <CheckCircle2 className={cn('text-blue-500', className)} aria-label="Task" />
    case 'bug':
      return <Bug className={cn('text-red-500', className)} aria-label="Bug" />
    case 'subtask':
      return <GitCommit className={cn('text-slate-500', className)} aria-label="Subtask" />
    default:
      return <CheckCircle2 className={cn('text-muted-foreground', className)} aria-label="Issue" />
  }
}
