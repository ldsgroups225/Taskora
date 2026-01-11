/* eslint-disable */
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('comments', () => {
  it('adds, lists, and deletes comments', async () => {
    const t = convexTest(schema, modules)

    const userId = await t.run(async (ctx) => {
      return ctx.db.insert('users', {
        name: 'Commenter',
        email: 'commenter@example.com',
        clerkId: 'user_commenter',
        role: 'dev',
      })
    })

    const projectId = await t.run(async (ctx) => {
      return ctx.db.insert('projects', {
        name: 'Comment Project',
        key: 'COMMENTS',
        leadId: userId,
      })
    })

    const authed = t.withIdentity({ subject: 'user_commenter', tokenIdentifier: 'https://clerk.taskora.com|user_commenter' })

    const issueId = await authed.mutation(api.issues.createIssue, {
      projectId,
      title: 'Issue with Comments',
      status: 'todo',
      priority: 'medium',
      type: 'task',
    })

    // 1. Add comment
    const commentId = await authed.mutation(api.comments.addComment, {
      issueId,
      content: 'Hello World',
    })

    // 2. List comments
    const comments = await authed.query(api.comments.listComments, { issueId })
    expect(comments.length).toBe(1)
    expect(comments[0].content).toBe('Hello World')
    expect(comments[0].authorName).toBe('Commenter')

    // 3. Delete comment
    await authed.mutation(api.comments.deleteComment, { id: commentId })
    const remainingComments = await authed.query(api.comments.listComments, { issueId })
    expect(remainingComments.length).toBe(0)
  })
})
