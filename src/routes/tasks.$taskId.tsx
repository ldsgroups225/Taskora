import type { Id } from '../../convex/_generated/dataModel'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  GitBranch,
  Layout,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Share2,
  User,
} from 'lucide-react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { cn } from '~/lib/utils'
import { issueQueries } from '~/queries'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetail,
  errorComponent: DefaultCatchBoundary,
  pendingComponent: TaskPending,
  loader: async ({ context, params }) => {
    // Convex uses WebSocket connections which only work in the browser
    // Skip prefetching during SSR - the client will handle fetching via useSuspenseQuery
    if (typeof document === 'undefined') {
      return
    }
    const queryClient = context.queryClient
    const taskId = params.taskId as Id<'issues'>
    // Prefetch both queries for client-side navigation
    await Promise.allSettled([
      queryClient.ensureQueryData(issueQueries.detail(taskId)),
      queryClient.ensureQueryData(issueQueries.children(taskId)),
    ])
  },
})

function TaskPending() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col gap-8 animate-pulse text-white">
      <div className="h-4 w-1/3 bg-white/5 rounded" />
      <div className="h-64 w-full bg-white/5 rounded-xl border border-white/5" />
    </div>
  )
}

function TaskDetail() {
  const { taskId } = Route.useParams()
  const { data: issue } = useSuspenseQuery(issueQueries.detail(taskId as Id<'issues'>))
  const { data: children } = useSuspenseQuery(issueQueries.children(taskId as Id<'issues'>))

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p>Task not found.</p>
        <Link to="/" className="text-indigo-400 hover:underline mt-2">
          Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Breadcrumb / Nav */}
      <header className="sticky top-16 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500 overflow-hidden">
          <Link
            to="/"
            className="hover:text-white transition-colors flex items-center gap-1 shrink-0"
          >
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">Views</span>
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-xs font-medium text-slate-400">
            {issue.projectId || 'Project'}
          </span>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <div className="flex items-center gap-2 text-indigo-400 font-medium truncate">
            <GitBranch className="w-4 h-4 shrink-0" />
            <span className="truncate">{issue.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <Badge
                  variant="outline"
                  className={cn(
                    'uppercase tracking-wider font-bold px-3 py-1',
                    issue.type === 'initiative'
                      ? 'border-purple-500/50 text-purple-400 bg-purple-500/10'
                      : issue.type === 'epic'
                        ? 'border-blue-500/50 text-blue-400 bg-blue-500/10'
                        : 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10',
                  )}
                >
                  {issue.type}
                </Badge>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5">
                    <Clock className="w-3 h-3" />
                    {new Date(issue._creationTime).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-1 rounded bg-white/5">
                    ID-
                    {issue._id.slice(-4).toUpperCase()}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {issue.title}
              </h1>
            </div>

            <div className="prose prose-invert prose-slate max-w-none">
              <p className="text-lg text-slate-300 leading-relaxed">
                {issue.description || 'No description provided.'}
              </p>
            </div>

            {/* Subtasks / Children */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Sub-tasks & Linked Issues
                </h3>
                <Button variant="ghost" size="sm" className="text-indigo-400 hover:bg-indigo-500/10 text-xs font-bold h-7">
                  <Plus className="w-3 h-3 mr-1" />
                  ADD CHILD
                </Button>
              </div>

              <div className="space-y-2">
                {children && children.length > 0
                  ? children.map((child: any) => (
                      <Link
                        key={child._id}
                        to="/tasks/$taskId"
                        params={{ taskId: child._id }}
                        className="block"
                      >
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/8 transition-all group"
                        >
                          <Circle className={cn(
                            'w-4 h-4',
                            child.status === 'done' ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-500',
                          )}
                          />
                          <span className="font-medium text-slate-200 group-hover:text-white">
                            {child.title}
                          </span>
                          <div className="ml-auto flex items-center gap-2">
                            <Badge variant="secondary" className="bg-black/50 text-slate-400 text-[10px] h-5">
                              {child.status}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400" />
                          </div>
                        </motion.div>
                      </Link>
                    ))
                  : (
                      <div className="p-8 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500 gap-2">
                        <Layout className="w-8 h-8 opacity-20" />
                        <p className="text-sm">No sub-tasks linked yet.</p>
                      </div>
                    )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                <CardTitle className="text-sm font-bold text-slate-300">Properties</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-[100px_1fr] gap-2 p-4 text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Assignee
                  </span>
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    {issue.assigneeId
                      ? (
                          <>
                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">
                              A
                            </div>
                            Alice Dev
                          </>
                        )
                      : <span className="text-slate-500 italic">Unassigned</span>}
                  </div>

                  <span className="text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Due Date
                  </span>
                  <span className="text-slate-300">Oct 24, 2024</span>

                  <span className="text-slate-500">Status</span>
                  <Badge variant="outline" className="w-fit border-white/10 text-slate-300">
                    {issue.status}
                  </Badge>

                  <span className="text-slate-500">Priority</span>
                  <div className="flex items-center gap-1 text-orange-400 font-bold">
                    {issue.priority}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-b from-indigo-900/20 to-transparent border-indigo-500/20 rounded-2xl">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  AI Orchestrator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm text-indigo-200/80">
                <p>
                  This task was automatically prioritized by Gemini based on the Q4 roadmap.
                  Suggestion: Assign to @Alice due to recent work on "Backend Core".
                </p>
                <Button size="sm" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/40">
                  Accept Suggestion
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
