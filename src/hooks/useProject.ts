import * as React from 'react'
import { ProjectContext } from '~/context/ProjectContextObject'

export function useProject() {
  const context = React.use(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
