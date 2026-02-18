/* eslint-disable */
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('projects performance', () => {
  it('measures deleteProject performance', async () => {
    const t = convexTest(schema, modules)

    const userId = await t.run(async (ctx) => {
      return ctx.db.insert('users', {
        name: 'Perf User',
        email: 'perf@example.com',
        clerkId: 'user_perf',
        role: 'dev',
      })
    })

    const projectId = await t.run(async (ctx) => {
      return ctx.db.insert('projects', {
        name: 'Perf Project',
        key: 'PERF',
        leadId: userId,
      })
    })

    // Seed Data
    await t.run(async (ctx) => {
      const issueIds = []
      // Create 100 issues (scaled up)
      for (let i = 0; i < 100; i++) {
        const issueId = await ctx.db.insert('issues', {
          projectId,
          title: `Issue ${i}`,
          status: 'todo',
          priority: 'medium',
          type: 'task',
          creatorId: userId,
          order: i,
        })
        issueIds.push(issueId)

        // Create 5 comments per issue
        for (let j = 0; j < 5; j++) {
          await ctx.db.insert('comments', {
            issueId,
            authorId: userId,
            content: `Comment ${j}`,
          })
        }

        // Create 5 activity logs per issue
        for (let j = 0; j < 5; j++) {
          await ctx.db.insert('activityLog', {
            issueId,
            userId,
            action: 'created',
          })
        }

        // Create 5 agent logs per issue
        for (let j = 0; j < 5; j++) {
          await ctx.db.insert('agentLogs', {
            projectId,
            issueId,
            action: 'generate',
            result: 'success',
            status: 'success',
          })
        }
      }
    })

    const authed = t.withIdentity({ subject: 'user_perf', tokenIdentifier: 'https://clerk.taskora.com|user_perf' })

    const start = Date.now()
    await authed.mutation(api.projects.deleteProject, { id: projectId })
    const duration = Date.now() - start

    console.log(`[BENCHMARK] deleteProject took ${duration}ms`)

    // Verify deletion
    const project = await t.run(async (ctx) => {
      return ctx.db.get(projectId)
    })
    expect(project).toBeNull()
  })
})
