import * as React from 'react'
import { ViewModeContext } from './ViewModeContextObject'

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = React.useState<'zen' | 'warroom'>('zen')

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
