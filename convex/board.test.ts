import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('board', () => {
  it('creates an item on an existing board', async () => {
    const t = convexTest(schema, modules)

    // 1. Setup - Create a board and a column
    const boardId = 'board-1'
    const columnId = 'column-1'

    await t.run(async (ctx) => {
      await ctx.db.insert('boards', {
        id: boardId,
        name: 'Test Board',
        color: '#ff0000',
      })
      await ctx.db.insert('columns', {
        id: columnId,
        boardId,
        name: 'Test Column',
        order: 0,
      })
    })

    // 2. Create an item
    const itemId = 'item-1'
    await t.mutation(api.board.createItem, {
      id: itemId,
      title: 'Test Item',
      boardId,
      columnId,
      order: 0,
    })

    // 3. Verify item exists
    const board = await t.query(api.board.getBoard, { id: boardId })
    // getBoard returns { ...board, columns: [...], items: [...] }
    expect(board.items).toHaveLength(1)
    expect(board.items[0]).toMatchObject({
      id: itemId,
      title: 'Test Item',
      boardId,
      columnId,
    })
  })

  it('fails to create an item when board does not exist', async () => {
    const t = convexTest(schema, modules)

    const itemId = 'item-2'
    const nonExistentBoardId = 'non-existent-board'
    const columnId = 'column-1'

    await expect(async () => {
      await t.mutation(api.board.createItem, {
        id: itemId,
        title: 'Test Item 2',
        boardId: nonExistentBoardId,
        columnId,
        order: 0,
      })
    }).rejects.toThrow(`missing board ${nonExistentBoardId}`)
  })
})
