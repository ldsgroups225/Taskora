import type { Doc, Id } from '../../convex/_generated/dataModel'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAction, useQuery } from 'convex/react'
import {
  Code2,
  FileText,
  Hash,
  LayoutPanelLeft,
  Loader2,
  Search,
  Settings,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import * as React from 'react'
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
import { useProject } from '~/context/ProjectContext'
import { RoleContext } from '~/context/RoleContext'
import { api } from '../../convex/_generated/api'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [parsedFilter, setParsedFilter] = React.useState<any>(null)
  const [isParsing, setIsParsing] = React.useState(false)

  const { setRole } = React.use(RoleContext)
  const { projectId } = useProject()
  const navigate = useNavigate()

  const parseQuery = useAction(api.aql.parseNaturalLanguageQuery)
  const results = useQuery(api.search.executeAqlQuery, parsedFilter && projectId ? { projectId: projectId as Id<'projects'>, filter: parsedFilter } : 'skip',
  )

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      setIsParsing(true)
      try {
        const filter = await parseQuery({ input: inputValue })
        if (filter && !filter.error) {
          setParsedFilter(filter)
        }
        else {
          setParsedFilter(null)
        }
      }
      catch (err) {
        console.error('Parsing failed', err)
      }
      finally {
        setIsParsing(false)
      }
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>
          K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div onKeyDown={handleKeyDown}>
          <CommandInput
            placeholder="Type an AQL query (e.g., 'tasks for me' or 'high priority items')..."
            value={inputValue}
            onValueChange={setInputValue}
          />
        </div>
        <CommandList>
          {isParsing && (
            <div className="p-4 flex items-center justify-center gap-2 text-sm text-indigo-400 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is parsing your query...
            </div>
          )}

          {parsedFilter && !isParsing && (
            <div className="px-4 py-2 border-b border-white/5 bg-indigo-500/5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs text-indigo-300">
                {parsedFilter.explanation || 'AI Interpreted Query'}
              </span>
              <button
                onClick={() => setParsedFilter(null)}
                className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider font-bold"
              >
                Clear
              </button>
            </div>
          )}

          {results && results.length > 0 && (
            <CommandGroup heading="AI Query Results">
              {(results as Doc<'issues'>[]).map(issue => (
                <CommandItem
                  key={issue._id}
                  onSelect={async () => {
                    await navigate({ to: '/tasks/$taskId', params: { taskId: issue._id } })
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 text-indigo-400" />
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200">{issue.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      {issue.status}
                      {' '}
                      •
                      {issue.priority}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {inputValue === '' && !parsedFilter && (
            <>
              <CommandEmpty>No results found. Try another query.</CommandEmpty>
              <CommandGroup heading="Recent / Seeded">
                <CommandItem className="cursor-pointer" asChild>
                  <Link to="/tasks/$taskId" params={{ taskId: 'jh74a4t1vbcsn7wpgkjtkpsrh97yztmm' }}>
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
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
