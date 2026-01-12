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
import { cn } from '~/lib/utils'
import { api } from '../../convex/_generated/api'

interface ProjectSelectorProps {
  selectedId?: string
  onSelect: (id: string) => void
  className?: string
}

export function ProjectSelector({ selectedId, onSelect, className }: ProjectSelectorProps) {
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
          className={cn('h-9 px-3 bg-card/5 border border-border/10 hover:bg-card/10 text-foreground flex items-center gap-2 rounded-xl transition-all', className)}
        >
          <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <LayoutPanelLeft className="w-3 h-3" />
          </div>
          <span className="max-w-[100px] truncate font-bold text-xs uppercase tracking-wider">
            {selectedProject?.name || 'Select Project'}
          </span>
          <ChevronsUpDown className="w-3 h-3 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-background border-border/10 text-foreground rounded-2xl p-1" align="start">
        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1.5 tracking-widest">
          PROJECTS
        </DropdownMenuLabel>
        {projects === undefined
          ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground animate-pulse">Loading...</div>
            )
          : projects.length === 0
            ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">No projects found</div>
              )
            : (
                projects.map(project => (
                  <DropdownMenuItem
                    key={project._id}
                    onClick={() => onSelect(project._id)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer hover:bg-card/5 data-highlighted:bg-card/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-foreground uppercase italic">{project.key}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[100px]">{project.name}</div>
                    </div>
                    {selectedId === project._id && <Check className="w-3 h-3 text-primary" />}
                  </DropdownMenuItem>
                ))
              )}
        <DropdownMenuSeparator className="bg-card/5 mx-1 my-1" />
        <DropdownMenuItem asChild>
          <Link
            to="/settings/projects"
            className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-primary hover:text-primary hover:bg-primary/5 data-highlighted:bg-primary/5"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold">Manage Projects</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
