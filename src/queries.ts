import type { Id } from '../convex/_generated/dataModel'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useMutation } from '@tanstack/react-query'
import { api } from '../convex/_generated/api'

export const boardQueries = {
  list: () => convexQuery(api.board.getBoards, {}),
  detail: (id: string) => convexQuery(api.board.getBoard, { id }),
}

export const issueQueries = {
  detail: (id: Id<'issues'>) => convexQuery(api.issues.getIssue, { id }),
  children: (parentId: Id<'issues'>) => convexQuery(api.issues.getChildren, { parentId }),
}

/**
 * Create a mutation hook for adding a new column to a board with an optimistic cache update.
 *
 * @returns A mutation hook that calls the `createColumn` API and optimistically appends a new column to the local board cache (`api.board.getBoard`) so the UI reflects the addition immediately.
 */
export function useCreateColumnMutation() {
  const mutationFn = useConvexMutation(
    api.board.createColumn,
  ).withOptimisticUpdate((localStore, args) => {
    const board = localStore.getQuery(api.board.getBoard, { id: args.boardId })
    if (!board)
      return

    const randomId = `${Math.random()}`

    const newBoard = {
      ...board,
      columns: [
        ...board.columns,
        {
          ...args,
          order: board.columns.length + 1,
          id: randomId,
          items: [],
        },
      ],
    }

    localStore.setQuery(api.board.getBoard, { id: board.id }, newBoard)
  })

  return useMutation({ mutationFn })
}

/**
 * Creates a mutation hook for adding an item to a board and applying an optimistic update to the local board cache.
 *
 * @returns A mutation hook that invokes the backend to create a board item and updates the local board query optimistically with the new item.
 */
export function useCreateItemMutation() {
  const mutationFn = useConvexMutation(
    api.board.createItem,
  ).withOptimisticUpdate((localStore, args) => {
    const board = localStore.getQuery(api.board.getBoard, { id: args.boardId })
    if (!board)
      return

    const items = [...board.items, args]
    localStore.setQuery(
      api.board.getBoard,
      { id: board.id },
      { ...board, items },
    )
  })

  return useMutation({ mutationFn })
}

/**
 * Creates a mutation hook to update a board item and applies an optimistic update to the local board cache.
 *
 * @returns A mutation hook that updates a board item; the optimistic update replaces the item with the same `id` in the cached board identified by `boardId`.
 */
export function useUpdateCardMutation() {
  const mutationFn = useConvexMutation(
    api.board.updateItem,
  ).withOptimisticUpdate((localStore, args) => {
    const board = localStore.getQuery(api.board.getBoard, { id: args.boardId })
    if (!board)
      return
    const items = board.items.map(item => (item.id === args.id ? args : item))
    localStore.setQuery(
      api.board.getBoard,
      { id: board.id },
      { ...board, items },
    )
  })

  return useMutation({ mutationFn })
}

/**
 * Create a mutation hook to delete a board item and optimistically remove it from the local board cache.
 *
 * The mutation calls `api.board.deleteItem` and, before the server round-trip completes,
 * updates the cached board (api.board.getBoard) by filtering out the deleted item.
 *
 * @returns A React Query mutation hook that deletes an item and applies an optimistic update removing that item from the cached board
 */
export function useDeleteCardMutation() {
  const mutationFn = useConvexMutation(
    api.board.deleteItem,
  ).withOptimisticUpdate((localStore, args) => {
    const board = localStore.getQuery(api.board.getBoard, { id: args.boardId })
    if (!board)
      return
    const items = board.items.filter(item => item.id !== args.id)
    localStore.setQuery(
      api.board.getBoard,
      { id: board.id },
      { ...board, items },
    )
  })

  return useMutation({ mutationFn })
}

/**
 * Create a mutation hook for deleting a board column and applying an optimistic local update.
 *
 * The optimistic update removes the column and any items belonging to that column from the cached board.
 *
 * @returns A React Query mutation hook that deletes a column; when executed it updates the local board cache to remove the column and its items and then performs the server mutation.
 */
export function useDeleteColumnMutation() {
  const mutationFn = useConvexMutation(
    api.board.deleteColumn,
  ).withOptimisticUpdate((localStore, args) => {
    const board = localStore.getQuery(api.board.getBoard, { id: args.boardId })
    if (!board)
      return
    const columns = board.columns.filter(col => col.id !== args.id)
    const items = board.items.filter(item => item.columnId !== args.id)
    localStore.setQuery(
      api.board.getBoard,
      { id: board.id },
      { ...board, items, columns },
    )
  })

  return useMutation({ mutationFn })
}

export function useUpdateBoardMutation() {
  const mutationFn = useConvexMutation(api.board.updateBoard)
  return useMutation({ mutationFn })
}

/**
 * Create a mutation hook that updates a board column and applies an optimistic update to the local board cache.
 *
 * @returns The mutation hook configured to invoke the board column update mutation and optimistically update the board stored in the local cache.
 */
export function useUpdateColumnMutation() {
  const mutationFn = useConvexMutation(
    api.board.updateColumn,
  ).withOptimisticUpdate((localStore, args) => {
    const board = localStore.getQuery(api.board.getBoard, { id: args.boardId })
    if (!board)
      return
    const columns = board.columns.map(col =>
      col.id === args.id ? { ...col, ...args } : col,
    )
    localStore.setQuery(
      api.board.getBoard,
      { id: board.id },
      { ...board, columns },
    )
  })

  return useMutation({ mutationFn })
}