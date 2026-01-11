import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { AlertCircle, Bot, CheckCircle2, Circle, Clock, Loader2, Plus, Sparkles, Zap } from 'lucide-react'
import * as React from 'react'
import { TaskForm } from '~/components/TaskForm'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { useMyTasks } from '~/hooks/useMyTasks'
import { cn } from '~/lib/utils'

export function ZenMode() {
  const { tasks, isLoading } = useMyTasks()
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto max-w-2xl px-4 py-12"
    >
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Focus</h1>
        <Button
          size="icon"
          onClick={() => setIsTaskFormOpen(true)}
          className="rounded-full bg-primary hover:bg-primary shadow-lg shadow-primary/20"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading
          ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Gathering your focus...</p>
              </div>
            )
          : tasks && tasks.length > 0
            ? (
                tasks.map((task, index) => (
                  <Link
                    key={task._id}
                    to="/tasks/$taskId"
                    params={{ taskId: task._id }}
                    className="block outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative flex items-center gap-4 bg-card/5 border border-border/10 p-4 rounded-2xl hover:bg-card/8 hover:border-border/20 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
                    >
                      <div className={cn(
                        'absolute inset-y-0 left-0 w-1 bg-primary/20',
                        task.priority === 'critical'
                          ? 'bg-destructive'
                          : task.priority === 'high'
                            ? 'bg-warning'
                            : 'bg-primary',
                      )}
                      />

                      <div className="shrink-0">
                        {task.status === 'done'
                          ? (
                              <CheckCircle2 className="w-6 h-6 text-success" />
                            )
                          : task.status === 'in_progress'
                            ? (
                                <Clock className="w-6 h-6 text-primary" />
                              )
                            : (
                                <Circle className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                              )}
                      </div>

                      <div className="grow min-w-0">
                        <h3 className={cn(
                          'font-medium text-lg leading-snug truncate transition-colors',
                          task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground',
                        )}
                        >
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4 border-border bg-background/50 text-muted-foreground">
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] uppercase font-bold py-0 h-4 border-border bg-background/50',
                                task.priority === 'critical'
                                  ? 'text-destructive border-destructive/20'
                                  : task.priority === 'high'
                                    ? 'text-warning border-warning/20'
                                    : 'text-primary border-primary/20',
                              )}
                            >
                              <AlertCircle className="w-2 h-2 mr-1" />
                              {task.priority}
                            </Badge>
                          </div>
                          {(task.properties?.aiReviewSummary || task.properties?.aiImpactSummary) && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4 border-accent/20 bg-accent/20 text-accent">
                              <Sparkles className="w-2 h-2 mr-1" />
                              AI
                            </Badge>
                          )}
                          {task.properties?.aiAssigned && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4 border-primary/20 bg-primary/20 text-primary">
                              <Bot className="w-2 h-2 mr-1" />
                              AI Assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )
            : (
                <div className="text-center py-20 px-6 rounded-3xl bg-card/2 border border-dashed border-border/10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Clear Sky</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    You've cleared your plate. Time to recharge or explore new initiatives.
                  </p>
                </div>
              )}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
        <p className="text-muted-foreground text-sm italic">
          "The secret of getting ahead is getting started."
        </p>
      </div>

      <TaskForm open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen} />
    </motion.div>
  )
}
