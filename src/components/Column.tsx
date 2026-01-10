import { forwardRef, useCallback, useMemo, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { flushSync } from 'react-dom'
import { CONTENT_TYPES } from '../types'
import {
  useDeleteColumnMutation,
  useUpdateCardMutation,
  useUpdateColumnMutation
} from '../queries'
import { EditableText } from './EditableText'
import { NewCard } from './NewCard'
import { Card } from './Card'
import type { RenderedItem } from '../types'
import { Card as ShadcnCard, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Plus, Trash2, MoreHorizontal } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '~/components/ui/scroll-area'
import { cn } from '~/lib/utils'

interface ColumnProps {
  name: string
  boardId: string
  columnId: string
  items: Array<RenderedItem>
  nextOrder: number
  previousOrder: number
  order: number
}

export const Column = forwardRef<HTMLDivElement, ColumnProps>(
  (
    { name, columnId, boardId, items, nextOrder, previousOrder, order },
    ref,
  ) => {
    const [acceptCardDrop, setAcceptCardDrop] = useState(false)
    const editState = useState(false)
    const [acceptColumnDrop, setAcceptColumnDrop] = useState<'none' | 'left' | 'right'>('none')
    const [isAddingCard, setIsAddingCard] = useState(false)

    const listRef = useRef<HTMLUListElement>(null!)

    const updateColumnMutation = useUpdateColumnMutation()
    const deleteColumnMutation = useDeleteColumnMutation()
    const updateCardMutation = useUpdateCardMutation()

    const sortedItems = useMemo(
      () => [...items].sort((a, b) => a.order - b.order),
      [items],
    )

    const cardDndProps = {
      onDragOver: (event: React.DragEvent) => {
        if (event.dataTransfer.types.includes(CONTENT_TYPES.card)) {
          event.preventDefault()
          setAcceptCardDrop(true)
        }
      },
      onDragLeave: () => {
        setAcceptCardDrop(false)
      },
      onDrop: (event: React.DragEvent) => {
        const transfer = JSON.parse(
          event.dataTransfer.getData(CONTENT_TYPES.card) || 'null',
        )

        if (!transfer) return

        invariant(transfer.id, 'missing transfer.id')
        invariant(transfer.title, 'missing transfer.title')

        updateCardMutation.mutate({
          order: (sortedItems[sortedItems.length - 1]?.order ?? 0) + 1,
          columnId: columnId,
          boardId,
          id: transfer.id,
          title: transfer.title,
        })

        setAcceptCardDrop(false)
      },
    }

    return (
      <div
        ref={ref}
        onDragOver={(event: React.DragEvent) => {
          if (event.dataTransfer.types.includes(CONTENT_TYPES.column)) {
            event.preventDefault()
            event.stopPropagation()
            const rect = event.currentTarget.getBoundingClientRect()
            const midpoint = (rect.left + rect.right) / 2
            setAcceptColumnDrop(event.clientX <= midpoint ? 'left' : 'right')
          }
        }}
        onDragLeave={() => setAcceptColumnDrop('none')}
        onDrop={(event: React.DragEvent) => {
          const transfer = JSON.parse(
            event.dataTransfer.getData(CONTENT_TYPES.column) || 'null',
          )
          if (!transfer) return

          invariant(transfer.id, 'missing transfer.id')

          const droppedOrder = acceptColumnDrop === 'left' ? previousOrder : nextOrder
          const moveOrder = (droppedOrder + order) / 2

          updateColumnMutation.mutate({
            boardId,
            id: transfer.id,
            order: moveOrder,
          })

          setAcceptColumnDrop('none')
        }}
        className={cn(
          "relative transition-all duration-200 px-3 shrink-0 flex flex-col h-full",
          acceptColumnDrop === 'left' && "pl-12",
          acceptColumnDrop === 'right' && "pr-12"
        )}
      >
        {acceptColumnDrop === 'left' && (
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-indigo-500 rounded-full animate-pulse" />
        )}

        <div
          draggable={!editState[0]}
          onDragStart={(event: React.DragEvent) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData(
              CONTENT_TYPES.column,
              JSON.stringify({ id: columnId, name }),
            )
          }}
          className={cn(
            "flex flex-col w-72 md:w-80 bg-slate-950/40 backdrop-blur-sm border border-white/5 rounded-2xl max-h-full transition-all group/column box-border",
            acceptCardDrop && "ring-2 ring-indigo-500 ring-inset"
          )}
          {...(!items.length ? cardDndProps : {})}
        >
          <div className="p-4 flex items-center justify-between" {...(items.length ? cardDndProps : {})}>
            <div className="flex items-center gap-3 grow">
              <EditableText
                fieldName="name"
                editState={editState}
                value={
                  updateColumnMutation.isPending && updateColumnMutation.variables.name
                    ? updateColumnMutation.variables.name
                    : name
                }
                inputLabel="Edit column name"
                buttonLabel={`Edit column "${name}" name`}
                buttonClassName="text-sm font-bold text-white uppercase tracking-wider"
                onChange={(value) => {
                  updateColumnMutation.mutate({
                    boardId,
                    id: columnId,
                    name: value,
                  })
                }}
              />
              <Badge variant="secondary" className="bg-white/5 text-slate-400 border-none font-mono text-[10px] py-0 h-4">
                {items.length}
              </Badge>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-opacity">
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  deleteColumnMutation.mutate({ id: columnId, boardId })
                }}
              >
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-400/10" type="submit">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </div>

          <div
            className="grow overflow-y-auto px-1 flex flex-col min-h-0"
            {...(items.length ? cardDndProps : {})}
          >
            <ul ref={listRef} className="space-y-px">
              {sortedItems.map((item, index, items) => (
                <Card
                  key={item.id}
                  title={item.title}
                  content={item.content ?? ''}
                  id={item.id}
                  boardId={boardId}
                  order={item.order}
                  columnId={columnId}
                  previousOrder={items[index - 1] ? items[index - 1].order : 0}
                  nextOrder={items[index + 1] ? items[index + 1].order : item.order + 1}
                />
              ))}
            </ul>
          </div>

          <div className="p-3 mt-auto" {...(items.length ? cardDndProps : {})}>
            {isAddingCard ? (
              <NewCard
                columnId={columnId}
                boardId={boardId}
                nextOrder={items.length === 0 ? 1 : items[items.length - 1].order + 1}
                onComplete={() => setIsAddingCard(false)}
              />
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-xs text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/5 h-9 rounded-xl font-bold uppercase tracking-wider gap-2"
                onClick={() => setIsAddingCard(true)}
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            )}
          </div>
        </div>

        {acceptColumnDrop === 'right' && (
          <div className="absolute right-3 top-0 bottom-0 w-1 bg-indigo-500 rounded-full animate-pulse" />
        )}
      </div>
    )
  },
)
Column.displayName = "Column"
