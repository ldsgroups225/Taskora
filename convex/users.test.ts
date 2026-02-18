import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = (import.meta as any).glob('./**/*.ts')

describe('users:inviteUser', () => {
  it('should fail if not authenticated', async () => {
    const t = convexTest(schema, modules)
    await expect(t.mutation(api.users.inviteUser, {
      email: 'newuser@example.com',
      role: 'dev',
    })).rejects.toThrow('Not authenticated')
  })

  it('should fail if not a manager', async () => {
    const t = convexTest(schema, modules)

    await t.run(async (ctx) => {
      await ctx.db.insert('users', {
        name: 'Dev User',
        email: 'dev@example.com',
        clerkId: 'user_dev',
        role: 'dev',
      })
    })

    const authed = t.withIdentity({ subject: 'user_dev' })

    await expect(authed.mutation(api.users.inviteUser, {
      email: 'newuser@example.com',
      role: 'dev',
    })).rejects.toThrow('Only managers can invite users')
  })

  it('should succeed if a manager', async () => {
    const t = convexTest(schema, modules)

    await t.run(async (ctx) => {
      await ctx.db.insert('users', {
        name: 'Manager User',
        email: 'manager@example.com',
        clerkId: 'user_manager',
        role: 'manager',
      })
    })

    const authed = t.withIdentity({ subject: 'user_manager' })

    const result = await authed.mutation(api.users.inviteUser, {
      email: 'newuser@example.com',
      role: 'dev',
    })

    expect(result).toEqual({ success: true })
  })
})
