import type { Id } from 'convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronDown, ChevronUp, Link as LinkIcon, Plus, User } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { useProject } from '~/hooks/ui-hooks'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { cn } from '~/lib/utils'
import { api } from '../../convex/_generated/api'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId?: Id<'issues'>
  initialProjectId?: string
  dismissOnOutsideClick?: boolean
}

export function TaskForm({ open, onOpenChange, parentId, initialProjectId, dismissOnOutsideClick = false }: TaskFormProps) {
  const { projectId: contextProjectId } = useProject()
  const { user } = useCurrentUser()
  const projects = useQuery(api.projects.listProjects)
  const users = useQuery(api.users.listUsers)
  const createIssue = useMutation(api.issues.createIssue)

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('')
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [type, setType] = React.useState<'task' | 'bug' | 'story' | 'epic' | 'initiative' | 'subtask'>(parentId ? 'subtask' : 'task')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // More options state
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = React.useState(false)
  const [assigneeId, setAssigneeId] = React.useState<string>(user?._id || '')
  const [startAt, setStartAt] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')
  const [linkedToId, setLinkedToId] = React.useState<string>('')
  const [linkType, setLinkType] = React.useState<string>('relates to')

  // Fetch issues for linking (from current project)
  const existingIssues = useQuery(
    api.issues.listIssues,
    selectedProjectId ? { projectId: selectedProjectId as Id<'projects'> } : 'skip',
  )

  // Sync state with props during render
  const [prevId, setPrevId] = React.useState<{ initialProjectId?: string, contextProjectId?: string | null, parentId?: string, open: boolean }>({ initialProjectId, contextProjectId, parentId: parentId as string, open })

  if (open && (initialProjectId !== prevId.initialProjectId || contextProjectId !== prevId.contextProjectId || open !== prevId.open)) {
    setPrevId({ initialProjectId, contextProjectId, parentId: parentId as string, open })
    setSelectedProjectId(initialProjectId || contextProjectId || '')
  }

  if (parentId && parentId !== prevId.parentId && type !== 'subtask') {
    setPrevId(prev => ({ ...prev, parentId: parentId as string }))
    setType('subtask')
  }

  const [prevUserId, setPrevUserId] = React.useState(user?._id)
  if (user?._id && user._id !== prevUserId && !assigneeId) {
    setPrevUserId(user._id)
    setAssigneeId(user._id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !selectedProjectId) {
      toast.error('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await createIssue({
        title,
        description,
        projectId: selectedProjectId as any,
        parentId,
        priority,
        type,
        status: 'todo',
        assigneeId: assigneeId as any || undefined,
        properties: {
          startAt: startAt || undefined,
          dueDate: dueDate || undefined,
          linkedTo: linkedToId || undefined,
          linkType: linkedToId ? linkType : undefined,
        },
      })
      toast.success(parentId ? 'Sub-task created' : 'Task created successfully')
      setTitle('')
      setDescription('')
      setStartAt('')
      setDueDate('')
      setLinkedToId('')
      setIsMoreOptionsOpen(false)
      onOpenChange(false)
    }
    catch (err) {
      const error = err as Error
      toast.error(error.message || 'Failed to create task')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-background border-border/10 text-foreground rounded-3xl shadow-2xl custom-scrollbar"
        onInteractOutside={(e) => {
          if (!dismissOnOutsideClick) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader className="px-1">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 text-foreground" />
            </div>
            {parentId ? 'Add Sub-task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {parentId ? 'Decompose this task into smaller manageable pieces.' : 'Add a new item to your backlog or focus list.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm md:text-sm font-bold text-foreground uppercase tracking-wider ml-1">
              Title
            </Label>
            <Input
              id="title"
              placeholder={parentId ? 'Sub-task title...' : 'What needs to be done?'}
              className="bg-card/5 border-border/10 rounded-2xl h-14 md:h-12 px-4 focus:ring-primary text-xl md:text-lg font-medium placeholder:text-muted-foreground"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm md:text-sm font-bold text-foreground uppercase tracking-wider ml-1">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              className="bg-card/5 border-border/10 rounded-2xl min-h-[120px] md:min-h-[100px] p-4 focus:ring-primary text-lg md:text-base placeholder:text-muted-foreground"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!parentId && (
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">
                  Project
                </Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="bg-card/5 border-border/10 rounded-xl h-12 md:h-11 focus:ring-primary">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border/10 text-foreground rounded-xl">
                    {projects && projects.map(project => (
                      <SelectItem key={project._id} value={project._id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-primary font-bold uppercase">{project.key}</span>
                          <span>{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className={cn('space-y-2', parentId ? 'col-span-2' : '')}>
              <Label className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">
                Priority
              </Label>
              <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                <SelectTrigger className="bg-card/5 border-border/10 rounded-xl h-12 md:h-11 focus:ring-primary">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border/10 text-foreground rounded-xl">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!parentId && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">
                Issue Type
              </Label>
              <div className="flex flex-wrap gap-2">
                {(['task', 'bug', 'story', 'epic'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-5 py-3 md:px-4 md:py-2 rounded-xl text-sm md:text-xs font-bold uppercase tracking-wider border transition-all min-w-[80px] md:min-w-0 ${
                      type === t
                        ? 'bg-primary/10 border-primary/50 text-foreground shadow-lg shadow-primary/10'
                        : 'bg-card/5 border-border/10 text-muted-foreground hover:bg-card/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* More Options Collapsible */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
              className="flex items-center gap-2 text-base md:text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest py-2"
            >
              {isMoreOptionsOpen ? <ChevronUp className="w-5 h-5 md:w-4 md:h-4" /> : <ChevronDown className="w-5 h-5 md:w-4 md:h-4" />}
              More options
            </button>

            <AnimatePresence>
              {isMoreOptionsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 pt-6 pb-2 px-1">
                    {/* Assignee */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {' '}
                        Assign To
                      </Label>
                      <Select value={assigneeId} onValueChange={setAssigneeId}>
                        <SelectTrigger className="bg-card/5 border-border/10 rounded-xl h-12 md:h-11 focus:ring-primary">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border/10 text-foreground rounded-xl">
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users?.map(u => (
                            <SelectItem key={u._id} value={u._id}>
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm md:text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <Calendar className="w-4 h-4 md:w-3 md:h-3" />
                          {' '}
                          Start At
                        </Label>
                        <Input
                          type="date"
                          value={startAt}
                          onChange={e => setStartAt(e.target.value)}
                          className="bg-card/5 border-border/10 rounded-xl h-12 md:h-11 focus:ring-primary text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm md:text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <Calendar className="w-4 h-4 md:w-3 md:h-3" />
                          {' '}
                          Due Date
                        </Label>
                        <Input
                          type="date"
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                          className="bg-card/5 border-border/10 rounded-xl h-12 md:h-11 focus:ring-primary text-base"
                        />
                      </div>
                    </div>

                    {/* Linking */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                          <LinkIcon className="w-3 h-3" />
                          {' '}
                          Linked To
                        </Label>
                        <Select value={linkedToId} onValueChange={setLinkedToId}>
                          <SelectTrigger className="bg-card/5 border-border/10 rounded-xl h-12 md:h-11 focus:ring-primary">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border/10 text-foreground rounded-xl">
                            <SelectItem value="none">None</SelectItem>
                            {existingIssues?.filter(i => i._id !== parentId && i.status !== 'done').map(i => (
                              <SelectItem key={i._id} value={i._id}>
                                {i.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">
                          Link Type
                        </Label>
                        <Select value={linkType} onValueChange={setLinkType} disabled={!linkedToId || linkedToId === 'none'}>
                          <SelectTrigger className="bg-card/5 border-border/10 rounded-xl h-12 md:h-11 focus:ring-primary">
                            <SelectValue placeholder="Relates to" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border/10 text-foreground rounded-xl">
                            <SelectItem value="blocks">Blocks</SelectItem>
                            <SelectItem value="blocked by">Blocked by</SelectItem>
                            <SelectItem value="relates to">Relates to</SelectItem>
                            <SelectItem value="duplicates">Duplicates</SelectItem>
                            <SelectItem value="duplicated by">Duplicated by</SelectItem>
                            <SelectItem value="parent of">Parent of</SelectItem>
                            <SelectItem value="child of">Child of</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="pt-4 px-1 pb-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground rounded-xl h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedProjectId}
              className="bg-primary hover:bg-primary rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 grow sm:grow-0"
            >
              {isSubmitting ? 'Creating...' : (parentId ? 'Add Child' : 'Create Task')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
