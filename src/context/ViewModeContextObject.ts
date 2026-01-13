import * as React from 'react'

export type ViewMode = 'zen' | 'warroom'

export interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
}

export const ViewModeContext = React.createContext<ViewModeContextType | undefined>(undefined)
