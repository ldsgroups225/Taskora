import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Check, ChevronsUpDown, LayoutPanelLeft, Plus } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { api } from '../../convex/_generated/api'

interface ProjectSelectorProps {
  selectedId?: string
  onSelect: (id: string) => void
}

export function ProjectSelector({ selectedId, onSelect }: ProjectSelectorProps) {
  const projects = useQuery(api.projects.listProjects)

  const selectedProject = React.useMemo(() => {
    return projects?.find(p => p._id === selectedId)
  }, [projects, selectedId])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center gap-2 rounded-xl transition-all"
        >
          <div className="w-5 h-5 rounded bg-indigo-600/20 flex items-center justify-center text-indigo-400">
            <LayoutPanelLeft className="w-3 h-3" />
          </div>
          <span className="max-w-[100px] truncate font-bold text-xs uppercase tracking-wider">
            {selectedProject?.name || 'Select Project'}
          </span>
          <ChevronsUpDown className="w-3 h-3 text-slate-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-900 border-white/10 text-white rounded-2xl p-1" align="start">
        <DropdownMenuLabel className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1.5 tracking-widest">
          PROJECTS
        </DropdownMenuLabel>
        {projects === undefined
          ? (
              <div className="px-2 py-1.5 text-xs text-slate-500 animate-pulse">Loading...</div>
            )
          : projects.length === 0
            ? (
                <div className="px-2 py-1.5 text-xs text-slate-500">No projects found</div>
              )
            : (
                projects.map(project => (
                  <DropdownMenuItem
                    key={project._id}
                    onClick={() => onSelect(project._id)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-white/5 data-highlighted:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-white uppercase italic">{project.key}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[100px]">{project.name}</div>
                    </div>
                    {selectedId === project._id && <Check className="w-3 h-3 text-indigo-400" />}
                  </DropdownMenuItem>
                ))
              )}
        <DropdownMenuSeparator className="bg-white/5 mx-1 my-1" />
        <DropdownMenuItem asChild>
          <Link
            to="/settings/projects"
            className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/5 data-highlighted:bg-indigo-400/5"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold">Manage Projects</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
