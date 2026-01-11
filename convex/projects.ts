import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List all projects for the current organization/user
 */
export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }
    return ctx.db.query('projects').collect()
  },
})

/**
 * Get a single project by ID
 */
export const getProject = query({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id)
  },
})

/**
 * Create a new project
 */
export const createProject = mutation({
  args: {
    name: v.string(),
    key: v.string(),
    description: v.optional(v.string()),
  },
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

    // Check if key is unique
    const existing = await ctx.db
      .query('projects')
      .withIndex('by_key', q => q.eq('key', args.key.toUpperCase()))
      .unique()

    if (existing) {
      throw new Error('Project key must be unique')
    }

    return ctx.db.insert('projects', {
      name: args.name,
      key: args.key.toUpperCase(),
      description: args.description,
      leadId: user._id,
    })
  },
})

/**
 * Update a project
 */
export const updateProject = mutation({
  args: {
    id: v.id('projects'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args
    await ctx.db.patch(id, patch)
  },
})

/**
 * Delete a project and its issues
 */
export const deleteProject = mutation({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    // 1. Delete all issues in project
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', args.id))
      .collect()

    for (const issue of issues) {
      await ctx.db.delete(issue._id)
    }

    // 2. Delete project
    await ctx.db.delete(args.id)
  },
})
