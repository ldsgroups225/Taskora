/* eslint-disable */
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('projects', () => {
  it('only allows the project lead to delete a project', async () => {
    const t = convexTest(schema, modules)

    // 1. Setup - Create two users
    const userAId = await t.run(async (ctx) => {
      return ctx.db.insert('users', {
        name: 'User A',
        email: 'userA@example.com',
        clerkId: 'user_A',
        role: 'dev',
      })
    })

    const userBId = await t.run(async (ctx) => {
      return ctx.db.insert('users', {
        name: 'User B',
        email: 'userB@example.com',
        clerkId: 'user_B',
        role: 'dev',
      })
    })

    // 2. Create a project with User A as the lead
    const projectId = await t.run(async (ctx) => {
      return ctx.db.insert('projects', {
        name: 'Project A',
        key: 'PROJA',
        leadId: userAId,
      })
    })

    // 3. Mock authentication for User B (not the lead)
    const authedB = t.withIdentity({ subject: 'user_B', tokenIdentifier: 'https://clerk.taskora.com|user_B' })

    // 4. Try to delete as User B - should fail
    await expect(authedB.mutation(api.projects.deleteProject, { id: projectId }))
      .rejects.toThrow('Only the project lead can delete this project')

    // 5. Mock authentication for User A (the lead)
    const authedA = t.withIdentity({ subject: 'user_A', tokenIdentifier: 'https://clerk.taskora.com|user_A' })

    // 6. Try to delete as User A - should succeed
    await authedA.mutation(api.projects.deleteProject, { id: projectId })

    // 7. Verify project is deleted
    const project = await t.run(async (ctx) => {
      return ctx.db.get(projectId)
    })
    expect(project).toBeNull()
  })
})
