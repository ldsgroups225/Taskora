/* eslint-disable */
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('search', () => {
  it('executes AQL queries with various filters', async () => {
    const t = convexTest(schema, modules)

    const userId = await t.run(async (ctx) => {
      return ctx.db.insert('users', {
        name: 'Me',
        email: 'me@example.com',
        clerkId: 'me_123',
        role: 'dev',
      })
    })

    const projectId = await t.run(async (ctx) => {
      return ctx.db.insert('projects', {
        name: 'Search Project',
        key: 'SEARCH',
        leadId: userId,
      })
    })

    const authed = t.withIdentity({ subject: 'me_123', tokenIdentifier: 'https://clerk.taskora.com|me_123' })

    // Seed issues
    await authed.mutation(api.issues.createIssue, {
      projectId,
      title: 'Critical Bug',
      status: 'todo',
      priority: 'critical',
      type: 'bug',
      assigneeId: userId,
    })

    await authed.mutation(api.issues.createIssue, {
      projectId,
      title: 'Medium Task',
      status: 'in_progress',
      priority: 'medium',
      type: 'task',
    })

    await authed.mutation(api.issues.createIssue, {
      projectId,
      title: 'High Bug',
      status: 'backlog',
      priority: 'high',
      type: 'bug',
    })

    // Test status filter
    const todoIssues = await authed.query(api.search.executeAqlQuery, {
      projectId,
      filter: { status: 'todo' },
    })
    expect(todoIssues.length).toBe(1)
    expect(todoIssues[0].title).toBe('Critical Bug')

    // Test priority filter
    const highIssues = await authed.query(api.search.executeAqlQuery, {
      projectId,
      filter: { priority: 'high' },
    })
    expect(highIssues.length).toBe(1)
    expect(highIssues[0].title).toBe('High Bug')

    // Test assignee me filter
    const myIssues = await authed.query(api.search.executeAqlQuery, {
      projectId,
      filter: { assignee: 'me' },
    })
    expect(myIssues.length).toBe(1)
    expect(myIssues[0].title).toBe('Critical Bug')

    // Test unassigned filter
    const unassignedIssues = await authed.query(api.search.executeAqlQuery, {
      projectId,
      filter: { assignee: 'unassigned' },
    })
    expect(unassignedIssues.length).toBe(2)

    // Test text search
    const bugIssues = await authed.query(api.search.executeAqlQuery, {
      projectId,
      filter: { textSearch: 'Bug' },
    })
    expect(bugIssues.length).toBe(2)
  })
})
