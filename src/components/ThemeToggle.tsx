import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'

/**
 * ThemeToggle component that allows users to switch between light, dark, and system themes.
 * Displays the current theme icon and provides a dropdown menu for theme selection.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/5 transition-all"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5" />
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="h-5 w-5" />
    }
    return <Sun className="h-5 w-5" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/5 transition-all"
          aria-label="Toggle theme"
        >
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'cursor-pointer',
            theme === 'light' && 'bg-accent text-accent-foreground',
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && (
            <span className="ml-auto text-xs">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'cursor-pointer',
            theme === 'dark' && 'bg-accent text-accent-foreground',
          )}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && (
            <span className="ml-auto text-xs">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'cursor-pointer',
            theme === 'system' && 'bg-accent text-accent-foreground',
          )}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === 'system' && (
            <span className="ml-auto text-xs">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
