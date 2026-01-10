import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Code2,
  LayoutPanelLeft,
  Search,
  Settings,
  User,
  Zap,
  Hash,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '~/components/ui/command'
import { RoleContext } from '~/routes/__root'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const { role, setRole } = React.useContext(RoleContext)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type an AQL query (e.g., 'tasks for me' or 'high priority items')..." />
        <CommandList>
          <CommandEmpty>No results found. Try another query.</CommandEmpty>
          <CommandGroup heading="Recent / Seeded">
            <CommandItem className="cursor-pointer" asChild>
              <Link to="/tasks/$taskId" params={{ taskId: "jh74a4t1vbcsn7wpgkjtkpsrh97yztmm" }}>
                <Hash className="mr-2 h-4 w-4 text-purple-400" />
                <span>Seeded Initiative (Taskora Alpha)</span>
              </Link>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Suggestions">
            <CommandItem className="cursor-pointer">
              <Zap className="mr-2 h-4 w-4 text-indigo-400" />
              <span>Groom Backlog</span>
              <CommandShortcut>⌘G</CommandShortcut>
            </CommandItem>
            <CommandItem className="cursor-pointer">
              <Search className="mr-2 h-4 w-4" />
              <span>Search Issues</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Switch Mode">
            <CommandItem
              onSelect={() => {
                setRole('dev')
                setOpen(false)
              }}
              className="cursor-pointer"
            >
              <Code2 className="mr-2 h-4 w-4" />
              <span>Zen Mode (Developer)</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setRole('manager')
                setOpen(false)
              }}
              className="cursor-pointer"
            >
              <LayoutPanelLeft className="mr-2 h-4 w-4" />
              <span>War Room (Manager)</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
