import * as React from 'react'
import { ProjectContext } from '../context/ProjectContextObject'
import { ViewModeContext } from '../context/ViewModeContextObject'

export { ProjectProvider } from '../context/ProjectContext'
export { ViewModeProvider } from '../context/ViewModeContext'

export function useProject() {
  const context = React.use(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

export function useViewMode() {
  const context = React.use(ViewModeContext)
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}
