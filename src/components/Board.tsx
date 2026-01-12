import type { Column } from 'convex/schema.js'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef } from 'react'
import { EditableText } from '~/components/EditableText.js'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { api } from '../../convex/_generated/api.js'
import { useUpdateBoardMutation } from '../queries.js'
import { Column as ColumnComponent } from './Column.js'
import { NewColumn } from './NewColumn.js'

export function Board({ boardId }: { boardId: string }) {
  const newColumnAddedRef = useRef(false)
  const updateBoardMutation = useUpdateBoardMutation()
  const { data: board } = useSuspenseQuery(
    convexQuery(api.board.getBoard, { id: boardId }),
  )

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const columnRef = useCallback((_node: HTMLElement | null) => {
    if (scrollContainerRef.current && newColumnAddedRef.current) {
      newColumnAddedRef.current = false
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
    }
  }, [])

  const itemsById = useMemo(
    () => new Map(board.items.map(item => [item.id, item])),
    [board.items],
  )

  type ColumnWithItems = Column & { items: typeof board.items }

  const columns = useMemo(() => {
    const columnsMap = new Map<string, ColumnWithItems>()
    for (const column of [...board.columns]) {
      columnsMap.set(column.id, { ...column, items: [] })
    }
    for (const item of itemsById.values()) {
      const columnId = item.columnId
      const column = columnsMap.get(columnId)
      if (column)
        column.items.push(item)
    }
    return [...columnsMap.values()].sort((a, b) => a.order - b.order)
  }, [board.columns, itemsById])

  return (
    <div className="grow flex flex-col min-h-0 bg-background/20">
      <header className="px-8 py-6 shrink-0 flex items-center justify-between">
        <h1 className="flex items-center gap-4">
          <div
            className="w-4 h-4 rounded-full shadow-lg"
            style={{ backgroundColor: board.color }}
          />
          <EditableText
            value={
              updateBoardMutation.isPending && updateBoardMutation.variables.name
                ? updateBoardMutation.variables.name
                : board.name
            }
            fieldName="boardName"
            buttonClassName="text-2xl font-bold text-foreground tracking-tight px-0 hover:bg-transparent"
            inputClassName="text-2xl font-bold tracking-tight bg-transparent border-none focus-visible:ring-0 p-0 h-auto"
            buttonLabel={`Edit board "${board.name}" name`}
            inputLabel="Edit board name"
            onChange={(value) => {
              updateBoardMutation.mutate({
                id: board.id,
                name: value,
              })
            }}
          />
        </h1>
      </header>

      <ScrollArea className="flex-1 px-4 md:px-8 pb-8 focus-visible:ring-0">
        <div className="flex items-start h-full min-h-[500px]" ref={scrollContainerRef}>
          {columns.map((col, index) => (
            <ColumnComponent
              ref={columnRef}
              key={col.id}
              name={col.name}
              columnId={col.id}
              boardId={board.id}
              items={col.items}
              order={col.order}
              previousOrder={columns[index - 1] ? columns[index - 1].order : 0}
              nextOrder={columns[index + 1] ? columns[index + 1].order : col.order + 1}
            />
          ))}
          <NewColumn
            boardId={board.id}
            editInitially={board.columns.length === 0}
            onNewColumnAdded={() => {
              newColumnAddedRef.current = true
            }}
          />
          {/* Spacer for scroll end */}
          <div className="w-12 shrink-0 h-full" />
        </div>
        <ScrollBar orientation="horizontal" className="h-2 bg-card/5" />
      </ScrollArea>
    </div>
  )
}
