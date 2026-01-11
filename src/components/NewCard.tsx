import { useRef } from 'react'
import invariant from 'tiny-invariant'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { itemSchema } from '../db/schema'
import { useCreateItemMutation } from '../queries'
import { ItemMutationFields } from '../types'

export function NewCard({
  columnId,
  boardId,
  nextOrder,
  onComplete,
}: {
  columnId: string
  boardId: string
  nextOrder: number
  onComplete: () => void
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { mutate } = useCreateItemMutation()

  return (
    <form
      method="post"
      className="p-3 bg-background border border-primary/30 rounded-xl space-y-3 shadow-xl shadow-primary/5 transition-all animate-in fade-in zoom-in duration-200"
      onSubmit={(event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const id = crypto.randomUUID()
        formData.set(ItemMutationFields.id.name, id)

        invariant(textAreaRef.current)
        if (textAreaRef.current.value.trim() === '')
          return

        mutate(itemSchema.parse(Object.fromEntries(formData.entries())))
        textAreaRef.current.value = ''
        onComplete()
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onComplete()
        }
      }}
    >
      <input type="hidden" name="boardId" value={boardId} />
      <input
        type="hidden"
        name={ItemMutationFields.columnId.name}
        value={columnId}
      />
      <input
        type="hidden"
        name={ItemMutationFields.order.name}
        value={nextOrder}
      />

      <Textarea
        autoFocus
        required
        ref={textAreaRef}
        name={ItemMutationFields.title.name}
        placeholder="Card title..."
        className="min-h-[80px] bg-background border-border/10 focus-visible:ring-primary resize-none text-sm p-3"
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            buttonRef.current?.click()
          }
          if (event.key === 'Escape') {
            onComplete()
          }
        }}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-primary hover:bg-primary text-xs font-bold grow" ref={buttonRef}>
          Add Card
        </Button>
        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground text-xs grow" onClick={onComplete}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
