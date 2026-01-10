import { useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { useCreateColumnMutation } from '../queries'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Plus, X } from 'lucide-react'
import { cn } from '~/utils/cn'

export function NewColumn({
  boardId,
  editInitially,
  onNewColumnAdded,
}: {
  boardId: string
  editInitially: boolean
  onNewColumnAdded: () => void
}) {
  const [editing, setEditing] = useState(editInitially)
  const inputRef = useRef<HTMLInputElement>(null)

  const newColumnMutation = useCreateColumnMutation()

  return (
    <div className="shrink-0 px-3 h-full">
      {editing ? (
        <form
          className="p-4 w-72 md:w-80 bg-slate-900 border border-indigo-500/30 rounded-2xl flex flex-col gap-3 shadow-2xl animate-in slide-in-from-right-4 duration-200"
          onSubmit={(event) => {
            event.preventDefault()
            const name = inputRef.current?.value || ''
            if (name.trim() === '') return

            newColumnMutation.mutate({
              boardId,
              name,
            })

            if (inputRef.current) inputRef.current.value = ''
            setEditing(false)
            onNewColumnAdded()
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setEditing(false)
            }
          }}
        >
          <Input
            autoFocus
            required
            ref={inputRef}
            type="text"
            placeholder="Column name..."
            className="bg-slate-950 border-white/10 focus-visible:ring-indigo-500 font-bold"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold grow">
              Add Column
            </Button>
            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-slate-500" onClick={() => setEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          onClick={() => setEditing(true)}
          className="w-72 md:w-80 h-14 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 rounded-2xl flex items-center justify-center gap-2 group transition-all"
        >
          <Plus className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all font-bold" />
          <span className="text-slate-500 group-hover:text-slate-300 font-bold uppercase tracking-wider text-xs">Add Column</span>
        </Button>
      )}
    </div>
  )
}
