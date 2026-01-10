import { GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import invariant from 'tiny-invariant'
import { Button } from '~/components/ui/button'
import { CardContent, Card as ShadcnCard } from '~/components/ui/card'
import { cn } from '~/lib/utils'
import { deleteItemSchema } from '../db/schema'
import { useDeleteCardMutation, useUpdateCardMutation } from '../queries'
import { CONTENT_TYPES } from '../types'

interface CardProps {
  title: string
  content: string | null
  id: string
  columnId: string
  boardId: string
  order: number
  nextOrder: number
  previousOrder: number
}

export function Card({ ref, title, content, id, columnId, boardId, order, nextOrder, previousOrder }: CardProps & { ref?: React.RefObject<HTMLLIElement | null> }) {
  const [acceptDrop, setAcceptDrop] = useState<'none' | 'top' | 'bottom'>(
    'none',
  )

  const deleteCard = useDeleteCardMutation()
  const moveCard = useUpdateCardMutation()

  return (
    <li
      ref={ref}
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(CONTENT_TYPES.card)) {
          event.preventDefault()
          event.stopPropagation()
          const rect = event.currentTarget.getBoundingClientRect()
          const midpoint = (rect.top + rect.bottom) / 2
          setAcceptDrop(event.clientY <= midpoint ? 'top' : 'bottom')
        }
      }}
      onDragLeave={() => {
        setAcceptDrop('none')
      }}
      onDrop={(event) => {
        event.stopPropagation()

        const transfer = JSON.parse(
          event.dataTransfer.getData(CONTENT_TYPES.card) || 'null',
        )

        if (!transfer) {
          return
        }

        invariant(transfer.id, 'missing cardId')
        invariant(transfer.title, 'missing title')

        const droppedOrder = acceptDrop === 'top' ? previousOrder : nextOrder
        const moveOrder = (droppedOrder + order) / 2

        moveCard.mutate({
          order: moveOrder,
          columnId,
          boardId,
          id: transfer.id,
          title: transfer.title,
        })

        setAcceptDrop('none')
      }}
      className={cn(
        'relative transition-all duration-200 py-1.5 px-2 list-none group',
        acceptDrop === 'top' && 'pt-8',
        acceptDrop === 'bottom' && 'pb-8',
      )}
    >
      {acceptDrop === 'top' && (
        <div className="absolute top-0 left-2 right-2 h-1 bg-indigo-500 rounded-full animate-pulse" />
      )}

      <ShadcnCard
        draggable
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'move'
          event.dataTransfer.setData(
            CONTENT_TYPES.card,
            JSON.stringify({ id, title }),
          )
          event.stopPropagation()
        }}
        className="bg-slate-900 border-white/10 hover:border-indigo-500/50 transition-colors shadow-sm cursor-grab active:cursor-grabbing group/card overflow-hidden"
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 grow">
              <GripVertical className="w-4 h-4 text-slate-600 group-hover/card:text-slate-400 transition-colors shrink-0" />
              <h3 className="text-sm font-semibold text-slate-200 leading-tight grow">{title}</h3>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                deleteCard.mutate(
                  deleteItemSchema.parse({
                    id,
                    boardId,
                  }),
                )
              }}
              className="shrink-0"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover/card:opacity-100 transition-opacity"
                type="submit"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </form>
          </div>
          {content && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pl-6">
              {content}
            </p>
          )}
        </CardContent>
      </ShadcnCard>

      {acceptDrop === 'bottom' && (
        <div className="absolute bottom-0 left-2 right-2 h-1 bg-indigo-500 rounded-full animate-pulse" />
      )}
    </li>
  )
}
Card.displayName = 'Card'
