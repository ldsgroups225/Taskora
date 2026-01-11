/* eslint-disable */
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('issues', () => {
  it('creates an issue and logs activity on update', async () => {
    const t = convexTest(schema, modules)

    // 1. Setup - Create a project and a user
    const userId = await t.run(async (ctx) => {
      return ctx.db.insert('users', {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'user_123',
        role: 'dev',
      })
    })

    const projectId = await t.run(async (ctx) => {
      return ctx.db.insert('projects', {
        name: 'Test Project',
        key: 'TEST',
        leadId: userId,
      })
    })

    // Mock authentication
    const authed = t.withIdentity({ subject: 'user_123', tokenIdentifier: 'https://clerk.taskora.com|user_123' })

    // 2. Create an issue
    const issueId = await authed.mutation(api.issues.createIssue, {
      projectId,
      title: 'First Issue',
      description: 'Test description',
      status: 'todo',
      priority: 'medium',
      type: 'task',
    })

    const issue = await authed.query(api.issues.getIssue, { id: issueId })
    expect(issue?.title).toBe('First Issue')
    expect(issue?.creatorId).toBe(userId)

    // 3. Update the issue
    await authed.mutation(api.issues.updateIssue, {
      id: issueId,
      patch: {
        status: 'in_progress',
        priority: 'high',
      },
    })

    const updatedIssue = await authed.query(api.issues.getIssue, { id: issueId })
    expect(updatedIssue?.status).toBe('in_progress')
    expect(updatedIssue?.priority).toBe('high')

    // 4. Verify activity log
    const logs = await authed.query(api.activityLog.getActivityLog, { issueId })
    expect(logs.length).toBe(2)
    expect(logs).toContainEqual(expect.objectContaining({
      action: 'status_change',
      oldValue: 'todo',
      newValue: 'in_progress',
    }))
    expect(logs).toContainEqual(expect.objectContaining({
      action: 'priority_change',
      oldValue: 'medium',
      newValue: 'high',
    }))
  })

  it('deletes an issue and its subtasks', async () => {
    const t = convexTest(schema, modules)

    const userId = await t.run(async (ctx) => {
      return ctx.db.insert('users', {
        name: 'Test User',
        email: 'test@example.com',
        clerkId: 'user_123',
        role: 'dev',
      })
    })

    const projectId = await t.run(async (ctx) => {
      return ctx.db.insert('projects', {
        name: 'Test Project',
        key: 'TEST_CASCADE',
        leadId: userId,
      })
    })

    const authed = t.withIdentity({ subject: 'user_123', tokenIdentifier: 'https://clerk.taskora.com|user_123' })

    const parentId = await authed.mutation(api.issues.createIssue, {
      projectId,
      title: 'Parent Issue',
      status: 'todo',
      priority: 'medium',
      type: 'task',
    })

    const subtaskId = await authed.mutation(api.issues.createIssue, {
      projectId,
      parentId,
      title: 'Subtask Issue',
      status: 'todo',
      priority: 'low',
      type: 'subtask',
    })

    // Verify both exist
    expect(await authed.query(api.issues.getIssue, { id: parentId })).not.toBeNull()
    expect(await authed.query(api.issues.getIssue, { id: subtaskId })).not.toBeNull()

    // Delete parent
    await authed.mutation(api.issues.deleteIssue, { id: parentId })

    // Verify both are gone
    expect(await authed.query(api.issues.getIssue, { id: parentId })).toBeNull()
    expect(await authed.query(api.issues.getIssue, { id: subtaskId })).toBeNull()
  })
})
