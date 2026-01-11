import { motion } from 'framer-motion'
import { AlertCircle, Bot, CheckCircle2, Circle, Clock, Loader2, Plus, Sparkles, Zap } from 'lucide-react'
import * as React from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { useMyTasks } from '~/hooks/useMyTasks'
import { cn } from '~/lib/utils'

export function ZenMode() {
  const { tasks, isLoading } = useMyTasks()

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
        {isLoading
          ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm font-medium">Gathering your focus...</p>
              </div>
            )
          : tasks && tasks.length > 0
            ? (
                tasks.map((task, index) => (
                  <motion.div
                    key={task._id}
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
                        {(task.properties?.aiReviewSummary || task.properties?.aiImpactSummary) && (
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4 border-purple-500/20 bg-purple-900/20 text-purple-400">
                            <Sparkles className="w-2 h-2 mr-1" />
                            AI
                          </Badge>
                        )}
                        {task.properties?.aiAssigned && (
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4 border-indigo-500/20 bg-indigo-900/20 text-indigo-400">
                            <Bot className="w-2 h-2 mr-1" />
                            AI Assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            : (
                <div className="text-center py-20 px-6 rounded-3xl bg-white/2 border border-dashed border-white/10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Clear Sky</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    You've cleared your plate. Time to recharge or explore new initiatives.
                  </p>
                </div>
              )}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
        <p className="text-slate-400 text-sm italic">
          "The secret of getting ahead is getting started."
        </p>
      </div>
    </motion.div>
  )
}
