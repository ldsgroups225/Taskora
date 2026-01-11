import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List all users in the system
 */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }
    return ctx.db.query('users').collect()
  },
})

/**
 * Update a user's role (dev or manager)
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id('users'),
    role: v.union(v.literal('dev'), v.literal('manager')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Only managers (or the user themselves) should be able to update roles usually.
    // Simplifying for now: any authenticated user but in a real app check permissions.
    await ctx.db.patch(args.userId, { role: args.role })
  },
})

/**
 * Update current user's role (used in onboarding)
 */
export const updateMyRole = mutation({
  args: { role: v.union(v.literal('dev'), v.literal('manager')) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .unique()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, { role: args.role })
  },
})

/**
 * "Invite" a user (placeholder logic for now)
 * In a real app, this might send an email or create a pending invitation record.
 */
export const inviteUser = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal('dev'), v.literal('manager')),
  },
  handler: async (_ctx, _args) => {
    // This is a placeholder as Clerk handles auth.
    // Usually we'd store the invitation in a table.
    console.log(`Inviting user ${_args.email} as ${_args.role}`)
    return { success: true }
  },
})
