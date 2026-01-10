import { useRef } from 'react'
import invariant from 'tiny-invariant'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { itemSchema } from '../db/schema'
import { useCreateItemMutation } from '../queries'
import { ItemMutationFields } from '../types'

/**
 * Render a form for creating a new card item inside a specific column.
 *
 * The form collects a title (required), includes hidden fields for boardId,
 * columnId, and order, generates a unique id for the new item, validates the
 * title is not empty, and submits the parsed item data via the create-item
 * mutation. The creation flow ends when the item is submitted, when the form
 * loses focus to an element outside the form, or when the user cancels.
 *
 * @param columnId - The id of the column where the new card will be created
 * @param boardId - The id of the board that contains the column
 * @param nextOrder - The numeric order value to assign to the new card
 * @param onComplete - Callback invoked to close or finalize the creation UI
 * @returns The React element for the new-card creation form
 */
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
      className="p-3 bg-slate-900 border border-indigo-500/30 rounded-xl space-y-3 shadow-xl shadow-indigo-500/5 transition-all animate-in fade-in zoom-in duration-200"
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
        className="min-h-[80px] bg-slate-950 border-white/10 focus-visible:ring-indigo-500 resize-none text-sm p-3"
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
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold grow" ref={buttonRef}>
          Add Card
        </Button>
        <Button size="sm" variant="ghost" className="text-slate-500 hover:text-white text-xs grow" onClick={onComplete}>
          Cancel
        </Button>
      </div>
    </form>
  )
}