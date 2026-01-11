import * as React from 'react'

export type ViewMode = 'zen' | 'warroom'

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  toggleViewMode: () => void
}

const ViewModeContext = React.createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('zen')

  const toggleViewMode = React.useCallback(() => {
    setViewMode(prev => (prev === 'zen' ? 'warroom' : 'zen'))
  }, [])

  const value = React.useMemo(() => ({
    viewMode,
    setViewMode,
    toggleViewMode,
  }), [viewMode, toggleViewMode])

  return (
    <ViewModeContext value={value}>
      {children}
    </ViewModeContext>
  )
}

export function useViewMode() {
  const context = React.use(ViewModeContext)
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}
