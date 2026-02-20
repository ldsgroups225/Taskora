import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('board actions', () => {
  it('creates a column successfully', async () => {
    const t = convexTest(schema, modules)

    // Setup: Create a board directly in the DB
    const boardId = 'board-1'
    await t.run(async (ctx) => {
      await ctx.db.insert('boards', {
        id: boardId,
        name: 'Test Board',
        color: '#ffffff',
      })
    })

    // Act: Create a column via mutation
    const columnName = 'To Do'
    await t.mutation(api.board.createColumn, {
      boardId,
      name: columnName,
    })

    // Assert: Verify column exists
    const columns = await t.run(async (ctx) => {
      return await ctx.db
        .query('columns')
        .withIndex('board', (q) => q.eq('boardId', boardId))
        .collect()
    })

    expect(columns).toHaveLength(1)
    expect(columns[0]).toMatchObject({
      boardId,
      name: columnName,
      order: 1,
    })
    expect(columns[0].id).toBeDefined()
  })

  it('increments order when creating multiple columns', async () => {
    const t = convexTest(schema, modules)

    const boardId = 'board-2'
    await t.run(async (ctx) => {
      await ctx.db.insert('boards', {
        id: boardId,
        name: 'Ordering Board',
        color: '#000000',
      })
    })

    // Create first column
    await t.mutation(api.board.createColumn, {
      boardId,
      name: 'Col 1',
    })

    // Create second column
    await t.mutation(api.board.createColumn, {
      boardId,
      name: 'Col 2',
    })

    const columns = await t.run(async (ctx) => {
      return await ctx.db
        .query('columns')
        .withIndex('board', (q) => q.eq('boardId', boardId))
        .collect()
    })

    // Sort by creation time/insertion order implicitly or explicitly by checking contents
    // Ideally createColumn sets 'order'. Let's verify.
    const col1 = columns.find(c => c.name === 'Col 1')
    const col2 = columns.find(c => c.name === 'Col 2')

    expect(col1?.order).toBe(1)
    expect(col2?.order).toBe(2)
  })

  it('fails to create a column if board does not exist', async () => {
    const t = convexTest(schema, modules)

    await expect(async () => {
      await t.mutation(api.board.createColumn, {
        boardId: 'non-existent-board',
        name: 'Ghost Column',
      })
    }).rejects.toThrowError(/missing board/)
  })
})
