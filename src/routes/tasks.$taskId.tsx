import type { Doc, Id } from '../../convex/_generated/dataModel'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  GitBranch,
  Layout,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { IssueActivity } from '~/components/IssueActivity'
import { IssueComments } from '~/components/IssueComments'
import { TaskForm } from '~/components/TaskForm'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { useViewMode } from '~/context/ViewModeContext'
import { cn } from '~/lib/utils'
import { issueQueries, userQueries, useUpdateIssueMutation } from '~/queries'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetail,
  errorComponent: DefaultCatchBoundary,
  pendingComponent: TaskPending,
  loader: async ({ context, params }) => {
    if (typeof document === 'undefined') {
      return
    }
    const queryClient = context.queryClient
    const taskId = params.taskId as Id<'issues'>
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
  const { viewMode } = useViewMode()
  const { taskId } = Route.useParams()
  const navigate = useNavigate()
  const { data: issue } = useSuspenseQuery(issueQueries.detail(taskId as Id<'issues'>))
  const { data: children } = useSuspenseQuery(issueQueries.children(taskId as Id<'issues'>))
  const { data: users } = useSuspenseQuery(userQueries.list()) as { data: Doc<'users'>[] }
  const parent = useQuery(api.issues.getIssue, issue?.parentId ? { id: issue.parentId } : 'skip')

  const [isAiInsightsOpen, setIsAiInsightsOpen] = React.useState(true)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(issue?.title || '')
  const [isEditingDesc, setIsEditingDesc] = React.useState(false)
  const [editedDesc, setEditedDesc] = React.useState(issue?.description || '')
  const [isTaskFormOpen, setIsTaskFormOpen] = React.useState(false)

  const updateIssue = useUpdateIssueMutation()
  const deleteIssue = useMutation(api.issues.deleteIssue)

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
    catch {
      toast.error('Failed to copy link')
    }
  }

  const handleDelete = async () => {
    if (!issue)
      return
    try {
      await deleteIssue({ id: issue._id })
      toast.success('Task deleted')
      void navigate({ to: '/' })
    }
    catch {
      toast.error('Failed to delete task')
    }
  }

  const handleAcceptAiSuggestion = async () => {
    if (!issue)
      return
    try {
      // Premium AI interaction: Move to In Progress and add a tag
      await updateIssue.mutateAsync({
        id: issue._id,
        patch: {
          status: 'in_progress',
          properties: {
            ...issue.properties,
            aiInteraction: 'accepted',
          },
        },
      })
      toast.success('AI orchestration suggestion accepted', {
        icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      })
    }
    catch {
      toast.error('Failed to accept AI suggestion')
    }
  }

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center grow text-slate-400">
        <p>Task not found.</p>
        <Link to="/" className="text-indigo-400 hover:underline mt-2">
          Go Home
        </Link>
      </div>
    )
  }

  return (
    <div className="grow bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-y-auto h-full">
      {/* Breadcrumb / Nav */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500 overflow-hidden">
          <Link
            to="/"
            className="hover:text-white transition-colors flex items-center gap-1 shrink-0"
          >
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline italic font-bold">Views</span>
          </Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-xs font-mono text-indigo-400 uppercase font-bold text-xs tracking-widest">
            {issue.projectId}
          </span>
          {parent && (
            <>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <Link
                to="/tasks/$taskId"
                params={{ taskId: parent._id }}
                className="hover:text-white transition-colors truncate max-w-[150px] text-slate-400 font-medium"
              >
                {parent.title}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 shrink-0" />
          <div className="flex items-center gap-2 text-white font-bold truncate">
            <GitBranch className="w-4 h-4 shrink-0 text-indigo-500" />
            <span className="truncate">{issue.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 border-white/10 text-white">Copy link</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-white/10 text-white">More actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white rounded-xl w-48">
              <DropdownMenuItem className="focus:bg-white/5 rounded-lg cursor-pointer">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-400 focus:text-red-400 focus:bg-red-400/5 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'px-4 md:px-8 py-8 md:py-12 transition-all duration-500',
            viewMode === 'zen'
              ? 'max-w-3xl mx-auto flex flex-col items-center'
              : 'grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16',
          )}
        >
          <div className={cn(
            'space-y-12 w-full',
            viewMode === 'zen' ? '' : 'lg:col-span-2',
          )}
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    'uppercase tracking-widest font-black text-[10px] px-3 py-1 rounded-lg',
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
                    className="uppercase tracking-widest font-black text-[10px] px-3 py-1 rounded-lg border-indigo-500/50 text-indigo-400 bg-indigo-500/10 flex items-center gap-1.5"
                  >
                    <Bot className="w-3 h-3" />
                    AI Assigned
                  </Badge>
                )}
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                    <Clock className="w-3 h-3" />
                    {new Date(issue._creationTime).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                    ID-
                    {issue._id.slice(-6).toUpperCase()}
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
                        className="text-4xl font-bold bg-white/2 border-white/10 h-auto py-2 focus:ring-indigo-500 rounded-2xl"
                      />
                    </div>
                  )
                : (
                    <h1
                      className="text-4xl md:text-5xl font-black text-white leading-tight cursor-text hover:text-indigo-400 transition-all decoration-indigo-500/30 underline-offset-8"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {issue.title}
                    </h1>
                  )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                Description
              </h2>
              {isEditingDesc
                ? (
                    <Textarea
                      value={editedDesc}
                      onChange={e => setEditedDesc(e.target.value)}
                      onBlur={handleUpdateDesc}
                      autoFocus
                      className="text-lg bg-white/2 border-white/10 min-h-[200px] p-6 focus:ring-indigo-500 rounded-3xl"
                      placeholder="Add a detailed description..."
                    />
                  )
                : (
                    <div
                      className="text-lg text-slate-300 leading-relaxed cursor-text hover:bg-white/2 p-4 -m-4 rounded-2xl transition-all min-h-[100px]"
                      onClick={() => setIsEditingDesc(true)}
                    >
                      {issue.description
                        ? (
                            <p className="whitespace-pre-wrap">{issue.description}</p>
                          )
                        : (
                            <span className="text-slate-600 italic font-medium">No description provided. Click to define the scope.</span>
                          )}
                    </div>
                  )}
            </div>

            {/* Subtasks */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
                  <Layout className="w-4 h-4 text-indigo-500" />
                  Sub-tasks
                </h3>
                <Button
                  onClick={() => setIsTaskFormOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-indigo-400 hover:text-white hover:bg-indigo-500/10 text-[10px] font-black tracking-widest h-8 px-3 rounded-lg"
                >
                  <Plus className="w-3 h-3 mr-1.5" />
                  ADD CHILD
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {children && children.length > 0
                  ? children.map((child: Doc<'issues'>) => (
                      <Link
                        key={child._id}
                        to="/tasks/$taskId"
                        params={{ taskId: child._id }}
                        className="block group"
                      >
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="flex items-center gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-white/5 transition-all shadow-sm"
                        >
                          <div className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center transition-colors border',
                            child.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-slate-700 group-hover:border-slate-500',
                          )}
                          >
                            {child.status === 'done' && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={cn(
                            'font-bold text-slate-200 group-hover:text-white transition-colors',
                            child.status === 'done' && 'text-slate-500 line-through',
                          )}
                          >
                            {child.title}
                          </span>
                          <div className="ml-auto flex items-center gap-3">
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-white/10 h-5 px-2">
                              {child.status}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
                          </div>
                        </motion.div>
                      </Link>
                    ))
                  : (
                      <div className="p-12 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-3 bg-white/1">
                        <Layout className="w-10 h-10 opacity-10" />
                        <p className="text-sm font-medium tracking-wide">No sub-tasks attached.</p>
                      </div>
                    )}
              </div>
            </div>

            <div className="space-y-12">
              <IssueComments issueId={issue._id} />
              <IssueActivity issueId={issue._id} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className={cn(
            'space-y-8',
            viewMode === 'zen' ? 'w-full mt-12 pb-20' : '',
          )}
          >
            <Card className="bg-white/2 border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="bg-white/2 border-b border-white/5 py-4 px-6 font-black uppercase tracking-widest text-[10px] text-slate-500">
                PROPERTIES
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      Assignee
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 justify-start px-3 hover:bg-white/5 text-slate-200 gap-3 font-bold rounded-xl w-full">
                          {issue.assigneeId
                            ? (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white shadow-lg shadow-indigo-500/20">
                                    {users?.find(u => u._id === issue.assigneeId)?.name[0] || 'A'}
                                  </div>
                                  <span className="truncate">{users?.find(u => u._id === issue.assigneeId)?.name || 'Unknown'}</span>
                                </>
                              )
                            : <span className="text-slate-500 italic text-xs">Unassigned</span>}
                          <ChevronDown className="w-3 h-3 ml-auto text-slate-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-slate-900 border-white/10 text-white rounded-xl w-56">
                        <DropdownMenuItem
                          onClick={() => updateIssue.mutate({ id: issue._id, patch: { assigneeId: undefined } })}
                          className="focus:bg-white/5 rounded-lg h-10 italic text-slate-400"
                        >
                          Unassigned
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        {users?.map(user => (
                          <DropdownMenuItem
                            key={user._id}
                            onClick={() => updateIssue.mutate({ id: issue._id, patch: { assigneeId: user._id } })}
                            className="focus:bg-white/5 rounded-lg h-10 font-medium"
                          >
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] mr-2">
                              {user.name[0]}
                            </div>
                            {user.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Status
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 justify-start px-3 hover:bg-white/5 rounded-xl w-full">
                          <Badge
                            variant="outline"
                            className="border-white/10 text-white font-black uppercase tracking-widest text-[9px] h-6 px-2 bg-white/5 shadow-sm"
                          >
                            {issue.status.replace('_', ' ')}
                            <ChevronDown className="w-3 h-3 ml-2 text-slate-600" />
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-slate-900 border-white/10 text-white rounded-xl w-48">
                        {['backlog', 'todo', 'in_progress', 'in_review', 'done'].map(status => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => updateIssue.mutate({ id: issue._id, patch: { status: status as any } })}
                            className="capitalize focus:bg-white/5 rounded-lg h-10 font-bold text-xs"
                          >
                            <div className={cn(
                              'w-2 h-2 rounded-full mr-3',
                              status === 'done' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-indigo-500' : 'bg-slate-700',
                            )}
                            />
                            {status.replace('_', ' ')}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center gap-4 px-6 py-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Priority
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 justify-start px-3 hover:bg-white/5 rounded-xl w-full text-left">
                          <div className={cn(
                            'flex items-center gap-1 font-black uppercase tracking-widest text-[10px]',
                            issue.priority === 'critical' ? 'text-red-500' : issue.priority === 'high' ? 'text-orange-500' : 'text-blue-500',
                          )}
                          >
                            {issue.priority}
                            <ChevronDown className="w-3 h-3 ml-1 text-slate-600" />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-slate-900 border-white/10 text-white rounded-xl w-48">
                        {['low', 'medium', 'high', 'critical'].map(priorityItem => (
                          <DropdownMenuItem
                            key={priorityItem}
                            onClick={() => updateIssue.mutate({ id: issue._id, patch: { priority: priorityItem as any } })}
                            className="capitalize focus:bg-white/5 rounded-lg h-10 font-bold text-xs"
                          >
                            <div className={cn(
                              'w-2 h-2 rounded-full mr-3',
                              priorityItem === 'critical' ? 'bg-red-500' : priorityItem === 'high' ? 'bg-orange-500' : 'bg-blue-500',
                            )}
                            />
                            {priorityItem}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            {(issue.properties?.aiReviewSummary || issue.properties?.aiImpactSummary) && (
              <Card className="bg-linear-to-b from-purple-900/10 to-transparent border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/5">
                <CardHeader
                  className="py-5 px-6 cursor-pointer hover:bg-purple-500/5 select-none"
                  onClick={() => setIsAiInsightsOpen(!isAiInsightsOpen)}
                >
                  <CardTitle className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4" />
                    AI Intelligence
                    <ChevronDown className={cn('w-4 h-4 ml-auto transition-transform duration-300 text-purple-600', isAiInsightsOpen && 'rotate-180')} />
                  </CardTitle>
                </CardHeader>
                {isAiInsightsOpen && (
                  <CardContent className="px-6 pb-6 pt-0 space-y-6">
                    {issue.properties?.aiReviewSummary && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Bot className="w-3 h-3" />
                          Agent Review
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-xs text-purple-200/90 bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10">
                          {issue.properties.aiReviewSummary}
                        </div>
                      </motion.div>
                    )}
                    {issue.properties?.aiImpactSummary && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Zap className="w-3 h-3" />
                          Risk Assessment
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-xs text-emerald-100/80 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                          {issue.properties.aiImpactSummary}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* AI Suggestion (Accept Flow) */}
            {(!issue.properties?.aiReviewSummary && !issue.properties?.aiImpactSummary && issue.status !== 'in_progress') && (
              <Card className="bg-linear-to-b from-indigo-900/10 to-transparent border-indigo-500/20 rounded-3xl shadow-2xl shadow-indigo-500/5">
                <CardHeader className="py-5 px-6">
                  <CardTitle className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4" />
                    AI Orchestrator
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 text-sm text-indigo-100/70">
                  <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-3xl space-y-4">
                    <p className="leading-relaxed">
                      This task aligns with our Q4 "Core Reliability" initiative. Gemini suggests promoting it to "In Progress" to meet the upcoming sprint deadline.
                    </p>
                    <Button
                      onClick={handleAcceptAiSuggestion}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20 rounded-xl font-bold h-11 transition-all active:scale-95"
                    >
                      Accept Suggestion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </motion.div>
      </main>

      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        parentId={issue._id}
        initialProjectId={issue.projectId}
      />
    </div>
  )
}

function LoadingIndicator() {
  return (
    <div className="h-8 flex items-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
