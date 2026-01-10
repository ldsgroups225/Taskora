import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Circle, Clock, Plus } from 'lucide-react'
import * as React from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface Task {
  id: string
  title: string
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

const mockTasks: Task[] = [
  { id: '1', title: 'Implement convex schema for Taskora', status: 'done', priority: 'high' },
  { id: '2', title: 'Integrate Gemini 2.5 Flash SDK', status: 'in_progress', priority: 'critical' },
  { id: '3', title: 'Design Zen Mode interface', status: 'todo', priority: 'medium' },
  { id: '4', title: 'Add mobile first responsiveness', status: 'todo', priority: 'medium' },
]

/**
 * Renders the Zen Mode focus interface that displays a list of tasks with animated entries, status icons, priority indicators, and a summary panel.
 *
 * The component includes a header with an add button, a stagger-animated task list where each item shows a colored priority bar, a status icon, title styling based on status, and status/priority badges, plus a bottom quote panel.
 *
 * @returns The React element for the Zen Mode UI.
 */
export function ZenMode() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto max-w-2xl px-4 py-12"
    >
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Focus</h1>
        <Button size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <div className="space-y-4">
        {mockTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className={cn(
              'absolute inset-y-0 left-0 w-1 bg-primary/20',
              task.priority === 'critical'
                ? 'bg-red-500'
                : task.priority === 'high'
                  ? 'bg-orange-500'
                  : 'bg-blue-500',
            )}
            />

            <div className="shrink-0">
              {task.status === 'done'
                ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  )
                : task.status === 'in_progress'
                  ? (
                      <Clock className="w-6 h-6 text-indigo-400" />
                    )
                  : (
                      <Circle className="w-6 h-6 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    )}
            </div>

            <div className="grow min-w-0">
              <h3 className={cn(
                'font-medium text-lg leading-snug truncate transition-colors',
                task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200',
              )}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4 border-slate-700 bg-slate-900/50 text-slate-400">
                  {task.status.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] uppercase font-bold py-0 h-4 border-slate-700 bg-slate-900/50',
                      task.priority === 'critical'
                        ? 'text-red-400 border-red-500/20'
                        : task.priority === 'high'
                          ? 'text-orange-400 border-orange-500/20'
                          : 'text-blue-400 border-blue-500/20',
                    )}
                  >
                    <AlertCircle className="w-2 h-2 mr-1" />
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
        <p className="text-slate-400 text-sm italic">
          "The secret of getting ahead is getting started."
        </p>
      </div>
    </motion.div>
  )
}