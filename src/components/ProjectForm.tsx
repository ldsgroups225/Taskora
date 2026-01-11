import type { ControllerRenderProps } from 'react-hook-form'
import type { Doc } from '../../convex/_generated/dataModel'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { api } from '../../convex/_generated/api'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  key: z.string().min(2, 'Key must be at least 2 characters').max(5, 'Key must be at most 5 characters'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProjectFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Doc<'projects'> | null // For editing
}

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const createProject = useMutation(api.projects.createProject)
  const updateProject = useMutation(api.projects.updateProject)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
    },
  })

  React.useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        key: project.key,
        description: project.description || '',
      })
    }
    else {
      form.reset({
        name: '',
        key: '',
        description: '',
      })
    }
  }, [project, form, open])

  async function onSubmit(values: FormValues) {
    try {
      if (project) {
        await updateProject({
          id: project._id,
          name: values.name,
          description: values.description,
        })
        toast.success('Project updated')
      }
      else {
        await createProject({
          name: values.name,
          key: values.key,
          description: values.description,
        })
        toast.success('Project created')
      }
      onOpenChange(false)
    }
    catch (err) {
      const error = err as Error
      toast.error(error.message || 'Failed to save project')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/10 text-foreground rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{project ? 'Edit Project' : 'New Project'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {project
              ? 'Update the project details below.'
              : 'Add a new project to start tracking your work.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: ControllerRenderProps<FormValues, 'name'> }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Acme Platform"
                      className="bg-card/5 border-border/10 rounded-xl focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }: { field: ControllerRenderProps<FormValues, 'key'> }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Project Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. ACME"
                      disabled={!!project}
                      className="bg-card/5 border-border/10 rounded-xl uppercase font-mono tracking-wider focus:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Short uppercase identifier (2-5 chars). Cannot be changed later.
                  </FormDescription>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: ControllerRenderProps<FormValues, 'description'> }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is this project about?"
                      className="bg-card/5 border-border/10 rounded-xl min-h-[100px] resize-none focus:ring-primary"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary rounded-xl px-8">
                {project ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
