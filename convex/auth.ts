import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'

/**
 * Store user from Clerk identity (called by frontend)
 */
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const { subject, email, name, pictureUrl } = identity

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', subject))
      .unique()

    if (existingUser) {
      const patch: Partial<Doc<'users'>> = {}
      if (email && existingUser.email !== email)
        patch.email = email
      if (name && existingUser.name !== name)
        patch.name = name
      if (pictureUrl && existingUser.avatarUrl !== pictureUrl)
        patch.avatarUrl = pictureUrl

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existingUser._id, patch)
      }
      return existingUser._id
    }

    return ctx.db.insert('users', {
      clerkId: subject,
      email: email || 'unknown',
      name: name || 'Anonymous',
      avatarUrl: pictureUrl,
      role: 'dev',
    })
  },
})

/**
 * Update or create a user from Clerk webhook (fallback/legacy)
 */
export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', args.clerkId))
      .unique()

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      })
      return existingUser._id
    }

    return ctx.db.insert('users', {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      role: 'dev', // Default role for new users
    })
  },
})

/**
 * Get current user from identity
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    return ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .unique()
  },
})
/**
 * Update user role
 */
export const updateUserRole = mutation({
  args: { role: v.union(v.literal('dev'), v.literal('manager')) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      throw new Error('Not authenticated')

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .unique()

    if (!user)
      throw new Error('User not found')

    await ctx.db.patch(user._id, { role: args.role })
  },
})
