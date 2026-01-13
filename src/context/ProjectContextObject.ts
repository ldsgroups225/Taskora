import * as React from 'react'

export interface ProjectContextType {
  projectId: string | null
  setProjectId: (id: string | null) => void
}

export const ProjectContext = React.createContext<ProjectContextType>({
  projectId: null,
  setProjectId: () => {},
})
