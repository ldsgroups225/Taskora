import { motion } from 'framer-motion'
import { Code2, LayoutPanelLeft } from 'lucide-react'
import { useRole } from '~/context/RoleContext'
import { useViewMode } from '~/context/ViewModeContext'
import { cn } from '~/lib/utils'

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode()
  const { setRole } = useRole()

  const modes = [
    { id: 'zen', label: 'Zen Mode', icon: Code2, role: 'dev' },
    { id: 'warroom', label: 'War Room', icon: LayoutPanelLeft, role: 'manager' },
  ] as const

  return (
    <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10 shrink-0 relative">
      {modes.map((mode) => {
        const isActive = viewMode === mode.id
        const Icon = mode.icon

        return (
          <button
            key={mode.id}
            onClick={() => {
              setViewMode(mode.id)
              setRole(mode.role)
            }}
            className={cn(
              'relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors z-10',
              isActive ? 'text-white' : 'text-slate-400 hover:text-white',
            )}
          >
            {isActive && (
              <motion.div
                layoutId="view-mode-pill"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/20"
                transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-20" />
            <span className="relative z-20">{mode.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
