import type { Id } from 'convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { Plus } from 'lucide-react'
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
import { useProject } from '~/context/ProjectContext'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { cn } from '~/lib/utils'
import { api } from '../../convex/_generated/api'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId?: Id<'issues'>
  initialProjectId?: string
}

export function TaskForm({ open, onOpenChange, parentId, initialProjectId }: TaskFormProps) {
  const { projectId: contextProjectId } = useProject()
  const { user } = useCurrentUser()
  const projects = useQuery(api.projects.listProjects)
  const createIssue = useMutation(api.issues.createIssue)

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('')
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [type, setType] = React.useState<'task' | 'bug' | 'story' | 'epic' | 'initiative' | 'subtask'>(parentId ? 'subtask' : 'task')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Sync selected project with context or prop
  React.useEffect(() => {
    if (open) {
      const targetId = initialProjectId || contextProjectId || ''
      if (targetId && selectedProjectId !== targetId) {
        setSelectedProjectId(targetId)
      }
    }
  }, [contextProjectId, initialProjectId, open, selectedProjectId])

  // Reset type when parentId changes
  React.useEffect(() => {
    if (parentId && type !== 'subtask') {
      setType('subtask')
    }
  }, [parentId, type])

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
        assigneeId: user?._id,
      })
      toast.success(parentId ? 'Sub-task created' : 'Task created successfully')
      setTitle('')
      setDescription('')
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
      <DialogContent className="sm:max-w-[500px] bg-background border-border/10 text-foreground rounded-3xl overflow-hidden shadow-2xl">
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
            <Label htmlFor="title" className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">
              Title
            </Label>
            <Input
              id="title"
              placeholder={parentId ? 'Sub-task title...' : 'What needs to be done?'}
              className="bg-card/5 border-border/10 rounded-2xl h-12 px-4 focus:ring-primary text-lg font-medium placeholder:text-muted-foreground"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold text-foreground uppercase tracking-wider ml-1">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              className="bg-card/5 border-border/10 rounded-2xl min-h-[100px] p-4 focus:ring-primary placeholder:text-muted-foreground"
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
                  <SelectTrigger className="bg-card/5 border-border/10 rounded-xl h-11 focus:ring-primary">
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
                <SelectTrigger className="bg-card/5 border-border/10 rounded-xl h-11 focus:ring-primary">
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
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
