import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('search performance benchmark', () => {
  it('benchmarks AQL query execution time', async () => {
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
        name: 'Benchmark Project',
        key: 'BENCH',
        leadId: userId,
      })
    })

    const authed = t.withIdentity({ subject: 'me_123', tokenIdentifier: 'https://clerk.taskora.com|me_123' })

    // Seed 1000 issues
    const seedCount = 5000
    console.log(`Seeding ${seedCount} issues...`)

    // We can't do this in a single transaction easily with convex-test from client side,
    // but let's try to batch it via t.run for speed
    await t.run(async (ctx) => {
      const statuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done'] as const
      const priorities = ['low', 'medium', 'high', 'critical'] as const
      const types = ['initiative', 'epic', 'story', 'task', 'bug', 'subtask'] as const

      for (let i = 0; i < seedCount; i++) {
        await ctx.db.insert('issues', {
          projectId,
          title: `Issue ${i}`,
          status: statuses[i % statuses.length],
          priority: priorities[i % priorities.length],
          type: types[i % types.length],
          assigneeId: i % 2 === 0 ? userId : undefined, // Assign half to me
          creatorId: userId,
          order: i,
        })
      }
    })

    console.log('Seeding complete.')

    // Helper to measure execution time
    const measure = async (name: string, filter: any) => {
      const start = performance.now()
      const result = await authed.query(api.search.executeAqlQuery, {
        projectId,
        filter,
      })
      const end = performance.now()
      console.log(`${name}: ${(end - start).toFixed(2)}ms, found ${result.length} issues`)
      return end - start
    }

    // Run measurements
    // Warm up?
    await measure('Warmup (No filter)', {})

    console.log('--- Benchmark Results ---')
    await measure('No Filter', {})
    await measure('Filter Status=todo', { status: 'todo' })
    await measure('Filter Assignee=me', { assignee: 'me' })
    await measure('Filter Assignee=me AND Status=todo', { assignee: 'me', status: 'todo' })
    await measure('Filter Priority=critical', { priority: 'critical' }) // No index optimization planned for priority alone yet
  })
})
