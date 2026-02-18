import { describe, expect, it, vi } from 'vitest'
import { api } from '../convex/_generated/api'

import { optimisticUpdateItem } from './queries'
// We mock the api module to avoid issues with complex objects from the real generated code
vi.mock('../convex/_generated/api', () => ({
  api: {
    board: {
      getBoard: 'mocked-getBoard',
    },
  },
}))

describe('optimisticUpdateItem', () => {
  it('should preserve system fields during update', () => {
    const boardId = 'board1'
    const itemId = 'item1'
    const originalItem = {
      id: itemId,
      title: 'Original Title',
      _id: 'system_id_123',
      _creationTime: 1234567890,
      boardId,
    }
    const board = {
      id: boardId,
      items: [originalItem],
    }

    const localStore = {
      getQuery: vi.fn().mockReturnValue(board),
      setQuery: vi.fn(),
      getAllQueries: vi.fn(),
    }

    const args = {
      id: itemId,
      boardId,
      title: 'New Title',
    }

    optimisticUpdateItem(localStore, args)

    expect(localStore.getQuery).toHaveBeenCalledWith(api.board.getBoard, { id: boardId })

    const setCall = localStore.setQuery.mock.calls[0]
    expect(setCall).toBeDefined()
    const [query, queryArgs, newBoard] = setCall

    expect(query).toBe(api.board.getBoard)
    expect(queryArgs).toEqual({ id: boardId })

    const updatedItem = newBoard.items[0]

    // These assertions should fail with the current implementation
    expect(updatedItem).toHaveProperty('_id', 'system_id_123')
    expect(updatedItem).toHaveProperty('_creationTime', 1234567890)
    expect(updatedItem.title).toBe('New Title')
  })
})
