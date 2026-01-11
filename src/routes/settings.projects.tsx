import type { Doc, Id } from '../../convex/_generated/dataModel'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { Edit2, LayoutPanelLeft, Plus, Rocket, Trash2 } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '~/components/ConfirmDialog'
import { ProjectForm } from '~/components/ProjectForm'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/settings/projects')({
  component: ProjectsSettings,
})

function ProjectsSettings() {
  const projects = useQuery(api.projects.listProjects)
  const deleteProject = useMutation(api.projects.deleteProject)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingProject, setEditingProject] = React.useState<Doc<'projects'> | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [projectToDelete, setProjectToDelete] = React.useState<Id<'projects'> | null>(null)

  const handleDelete = async (id: Id<'projects'>) => {
    setProjectToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!projectToDelete)
      return
    try {
      await deleteProject({ id: projectToDelete })
      toast.success('Project deleted')
    }
    catch {
      toast.error('Failed to delete project')
    }
    finally {
      setDeleteConfirmOpen(false)
      setProjectToDelete(null)
    }
  }

  const handleEdit = (project: Doc<'projects'>) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-500">Manage your project environments and keys.</p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null)
            setIsFormOpen(true)
          }}
          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects === undefined
          ? (
              Array.from({ length: 3 }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Skeleton key={`skeleton-${i}`} className="h-32 w-full rounded-2xl bg-white/5" />
              ))
            )
          : projects.length === 0
            ? (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white">No projects yet</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                    Create your first project to start tracking issues and orchestrating agents.
                  </p>
                </div>
              )
            : (
                projects.map(project => (
                  <Card key={project._id} className="bg-white/5 border-white/10 rounded-2xl overflow-hidden group hover:bg-white/8 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                          <LayoutPanelLeft className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-white">{project.name}</CardTitle>
                          <CardDescription className="font-mono text-indigo-400 mt-1 uppercase">
                            {project.key}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(project)}
                          className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => handleDelete(project._id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {project.description && (
                      <CardContent className="px-6 pb-6 pt-0">
                        <p className="text-slate-400 text-sm leading-relaxed">{project.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
      </div>

      <ProjectForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        project={editingProject}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? All associated issues and data will be permanently lost."
        confirmText="Delete Project"
        variant="destructive"
      />
    </div>
  )
}
