import type { Doc, Id } from '../../convex/_generated/dataModel'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import {
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  GitBranch,
  Layout,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Share2,
  Sparkles,
  User,
} from 'lucide-react'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { IssueActivity } from '~/components/IssueActivity'
import { IssueComments } from '~/components/IssueComments'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'
import { issueQueries, userQueries, useUpdateIssueMutation } from '~/queries'
import { api } from '../../convex/_generated/api'

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
  const { data: users } = useSuspenseQuery(userQueries.list()) as { data: Doc<'users'>[] }
  const parent = useQuery(api.issues.getIssue, issue?.parentId ? { id: issue.parentId } : 'skip')

  const [isAiInsightsOpen, setIsAiInsightsOpen] = React.useState(true)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(issue?.title || '')
  const [isEditingDesc, setIsEditingDesc] = React.useState(false)
  const [editedDesc, setEditedDesc] = React.useState(issue?.description || '')

  const updateIssue = useUpdateIssueMutation()

  React.useEffect(() => {
    if (issue) {
      setEditedTitle(issue.title)
      setEditedDesc(issue.description || '')
    }
  }, [issue])

  const handleUpdateTitle = async () => {
    if (!issue || editedTitle.trim() === issue.title || !editedTitle.trim()) {
      setIsEditingTitle(false)
      return
    }
    await updateIssue.mutateAsync({ id: issue._id, patch: { title: editedTitle.trim() } })
    setIsEditingTitle(false)
  }

  const handleUpdateDesc = async () => {
    if (!issue || editedDesc === (issue.description || '')) {
      setIsEditingDesc(false)
      return
    }
    await updateIssue.mutateAsync({ id: issue._id, patch: { description: editedDesc } })
    setIsEditingDesc(false)
  }

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
            {issue.projectId}
          </span>
          {parent && (
            <>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <Link
                to="/tasks/$taskId"
                params={{ taskId: parent._id }}
                className="hover:text-white transition-colors truncate max-w-[100px] text-slate-500"
              >
                {parent.title}
              </Link>
            </>
          )}
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
                {issue.properties?.aiAssigned && (
                  <Badge
                    variant="outline"
                    className="uppercase tracking-wider font-bold px-3 py-1 border-indigo-500/50 text-indigo-400 bg-indigo-500/10 flex items-center gap-1"
                  >
                    <Bot className="w-3 h-3" />
                    AI Assigned
                  </Badge>
                )}
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

              {isEditingTitle
                ? (
                    <div className="flex gap-2">
                      <Input
                        value={editedTitle}
                        onChange={e => setEditedTitle(e.target.value)}
                        onBlur={handleUpdateTitle}
                        onKeyDown={async e => e.key === 'Enter' && handleUpdateTitle()}
                        autoFocus
                        className="text-3xl font-bold bg-white/5 border-indigo-500/50 h-auto py-2"
                      />
                    </div>
                  )
                : (
                    <h1
                      className="text-3xl md:text-4xl font-bold text-white leading-tight cursor-text hover:text-indigo-300 transition-colors"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {issue.title}
                    </h1>
                  )}
            </div>

            <div className="prose prose-invert prose-slate max-w-none">
              {isEditingDesc
                ? (
                    <Textarea
                      value={editedDesc}
                      onChange={e => setEditedDesc(e.target.value)}
                      onBlur={handleUpdateDesc}
                      autoFocus
                      className="text-lg bg-white/5 border-indigo-500/50 min-h-[150px]"
                      placeholder="Add a description..."
                    />
                  )
                : (
                    <p
                      className="text-lg text-slate-300 leading-relaxed cursor-text hover:text-white transition-colors min-h-[24px]"
                      onClick={() => setIsEditingDesc(true)}
                    >
                      {issue.description || <span className="text-slate-600 italic">No description provided. Click to add.</span>}
                    </p>
                  )}
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
                  ? children.map((child: Doc<'issues'>) => (
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

            <IssueComments issueId={issue._id} />
            <IssueActivity issueId={issue._id} />
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent text-slate-300 gap-2 font-medium">
                          {issue.assigneeId
                            ? (
                                <>
                                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">
                                    {users?.find(u => u._id === issue.assigneeId)?.name[0] || 'A'}
                                  </div>
                                  {users?.find(u => u._id === issue.assigneeId)?.name || 'Unknown'}
                                </>
                              )
                            : <span className="text-slate-500 italic">Unassigned</span>}
                          <ChevronDown className="w-3 h-3 text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-slate-900 border-white/10 text-slate-300">
                        <DropdownMenuItem
                          onClick={() => updateIssue.mutate({ id: issue._id, patch: { assigneeId: undefined } })}
                          className="hover:bg-white/5"
                        >
                          Unassigned
                        </DropdownMenuItem>
                        {users?.map(user => (
                          <DropdownMenuItem
                            key={user._id}
                            onClick={() => updateIssue.mutate({ id: issue._id, patch: { assigneeId: user._id } })}
                            className="hover:bg-white/5"
                          >
                            {user.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <span className="text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Due Date
                  </span>
                  <span className="text-slate-300">Oct 24, 2024</span>

                  <span className="text-slate-500">Status</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent justify-start">
                        <Badge variant="outline" className="w-fit border-white/10 text-slate-300 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5">
                          {issue.status}
                          <ChevronDown className="w-3 h-3 ml-2 text-slate-600" />
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-slate-900 border-white/10 text-slate-300">
                      {['backlog', 'todo', 'in_progress', 'in_review', 'done'].map(status => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => updateIssue.mutate({ id: issue._id, patch: { status: status as any } })}
                          className="capitalize hover:bg-white/5"
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <span className="text-slate-500">Priority</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent justify-start">
                        <div className="flex items-center gap-1 text-orange-400 font-bold hover:text-orange-300 cursor-pointer">
                          {issue.priority}
                          <ChevronDown className="w-3 h-3 ml-1 text-slate-600" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-slate-900 border-white/10 text-slate-300">
                      {['low', 'medium', 'high', 'critical'].map(priorityItem => (
                        <DropdownMenuItem
                          key={priorityItem}
                          onClick={() => updateIssue.mutate({ id: issue._id, patch: { priority: priorityItem as any } })}
                          className="capitalize hover:bg-white/5"
                        >
                          {priorityItem}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights (Collapsible) */}
            {(issue.properties?.aiReviewSummary || issue.properties?.aiImpactSummary) && (
              <Card className="bg-linear-to-b from-purple-900/20 to-transparent border-purple-500/20 rounded-2xl overflow-hidden transition-all duration-300">
                <CardHeader
                  className="py-4 cursor-pointer hover:bg-purple-500/5 select-none"
                  onClick={() => setIsAiInsightsOpen(!isAiInsightsOpen)}
                >
                  <CardTitle className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Insights
                    <ChevronDown className={cn('w-4 h-4 ml-auto transition-transform', isAiInsightsOpen && 'rotate-180')} />
                  </CardTitle>
                </CardHeader>
                {isAiInsightsOpen && (
                  <CardContent className="p-4 pt-0 text-sm text-purple-200/80 space-y-4">
                    {issue.properties?.aiReviewSummary && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <div className="text-[10px] font-bold text-purple-400 uppercase mb-1 flex items-center gap-1">
                          Review Summary
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-xs">
                          {issue.properties.aiReviewSummary}
                        </div>
                      </motion.div>
                    )}
                    {issue.properties?.aiImpactSummary && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1 flex items-center gap-1">
                          Impact Summary
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-xs text-emerald-100/80">
                          {issue.properties.aiImpactSummary}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Legacy Placeholder (Only show if no AI content) */}
            {(!issue.properties?.aiReviewSummary && !issue.properties?.aiImpactSummary) && (
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
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
