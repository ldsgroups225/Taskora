import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('board actions', () => {
  it('creates a column successfully', async () => {
    const t = convexTest(schema, modules)

    const clerkId = 'user_1'
    // Setup: Create a user and a board directly in the DB
    const boardId = 'board-1'
    await t.run(async (ctx) => {
      await ctx.db.insert('users', {
        name: 'Test User',
        email: 'test@example.com',
        clerkId,
        role: 'manager',
      })
      await ctx.db.insert('boards', {
        id: boardId,
        name: 'Test Board',
        color: '#ffffff',
      })
    })

    const authed = t.withIdentity({ subject: clerkId })

    // Act: Create a column via mutation
    const columnName = 'To Do'
    await authed.mutation(api.board.createColumn, {
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

    const clerkId = 'user_1'
    const boardId = 'board-2'
    await t.run(async (ctx) => {
      await ctx.db.insert('users', {
        name: 'Test User',
        email: 'test@example.com',
        clerkId,
        role: 'manager',
      })
      await ctx.db.insert('boards', {
        id: boardId,
        name: 'Ordering Board',
        color: '#000000',
      })
    })

    const authed = t.withIdentity({ subject: clerkId })

    // Create first column
    await authed.mutation(api.board.createColumn, {
      boardId,
      name: 'Col 1',
    })

    // Create second column
    await authed.mutation(api.board.createColumn, {
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
    const clerkId = 'user_1'
    await t.run(async (ctx) => {
      await ctx.db.insert('users', {
        name: 'Test User',
        email: 'test@example.com',
        clerkId,
        role: 'manager',
      })
    })

    const authed = t.withIdentity({ subject: clerkId })

    await expect(async () => {
      await authed.mutation(api.board.createColumn, {
        boardId: 'non-existent-board',
        name: 'Ghost Column',
      })
    }).rejects.toThrowError(/missing board/)
  })

  it('updateBoard fails without authentication', async () => {
    const t = convexTest(schema, modules)
    const boardId = 'vulnerable-board'
    await t.run(async (ctx) => {
      await ctx.db.insert('boards', {
        id: boardId,
        name: 'Vulnerable Board',
        color: '#ff0000',
      })
    })

    // This should now fail
    await expect(t.mutation(api.board.updateBoard, {
      id: boardId,
      name: 'Pwned Board',
    })).rejects.toThrow('Not authenticated')
  })

  it('updateBoard fails if user not in database', async () => {
    const t = convexTest(schema, modules)
    const boardId = 'vulnerable-board'
    await t.run(async (ctx) => {
      await ctx.db.insert('boards', {
        id: boardId,
        name: 'Vulnerable Board',
        color: '#ff0000',
      })
    })

    const authed = t.withIdentity({ subject: 'unknown_user' })

    await expect(authed.mutation(api.board.updateBoard, {
      id: boardId,
      name: 'Pwned Board',
    })).rejects.toThrow('User not found')
  })
})
