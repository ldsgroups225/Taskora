import * as React from 'react'
import { ProjectContext } from './ProjectContextObject'

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setProjectId] = React.useState<string | null>(() => {
    // Try to restore from localStorage locally
    if (typeof window !== 'undefined') {
      return localStorage.getItem('taskora_project_id')
    }
    return null
  })

  const updateProjectId = (id: string | null) => {
    setProjectId(id)
    if (id) {
      localStorage.setItem('taskora_project_id', id)
    }
    else {
      localStorage.removeItem('taskora_project_id')
    }
  }

  return (
    <ProjectContext value={{ projectId, setProjectId: updateProjectId }}>
      {children}
    </ProjectContext>
  )
}
