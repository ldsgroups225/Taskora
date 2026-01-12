import { Plus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useCreateColumnMutation } from '../queries'

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
      {editing
        ? (
            <form
              className="p-5 w-[85vw] md:w-80 bg-background border border-primary/30 rounded-2xl flex flex-col gap-4 shadow-2xl animate-in slide-in-from-right-4 duration-200"
              onSubmit={(event) => {
                event.preventDefault()
                const name = inputRef.current?.value || ''
                if (name.trim() === '')
                  return

                newColumnMutation.mutate({
                  boardId,
                  name,
                })

                if (inputRef.current)
                  inputRef.current.value = ''
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
                className="bg-background border-border/10 focus-visible:ring-primary font-bold"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-primary hover:bg-primary text-sm md:text-xs font-bold grow h-11 md:h-9">
                  Add Column
                </Button>
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-muted-foreground" onClick={() => setEditing(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )
        : (
            <Button
              variant="outline"
              onClick={() => setEditing(true)}
              className="w-[85vw] md:w-80 h-16 md:h-14 border-dashed border-border/10 bg-card/5 hover:bg-card/10 hover:border-primary/50 rounded-2xl flex items-center justify-center gap-2 group transition-all"
            >
              <Plus className="w-6 h-6 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all font-bold" />
              <span className="text-muted-foreground group-hover:text-foreground font-bold uppercase tracking-wider text-sm md:text-xs">Add Column</span>
            </Button>
          )}
    </div>
  )
}
