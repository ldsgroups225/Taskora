import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalQuery, mutation, query } from './_generated/server'

/**
 * List all projects (internal use only)
 */
export const listProjectsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('projects').collect()
  },
})

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

    const projectId = await ctx.db.insert('projects', {
      name: args.name,
      key: args.key.toUpperCase(),
      description: args.description,
      leadId: user._id,
    })

    // Trigger metrics cache initialization
    await ctx.scheduler.runAfter(0, internal.metrics.updateProjectSummary, {
      projectId,
    })

    return projectId
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
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      throw new Error('Not authenticated')

    const { id, ...patch } = args
    const project = await ctx.db.get(id)
    if (!project)
      throw new Error('Project not found')

    await ctx.db.patch(id, patch)
  },
})

/**
 * Delete a project and its issues
 */
export const deleteProject = mutation({
  args: { id: v.id('projects') },
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

    const project = (await ctx.db.get(args.id))
    if (!project)
      throw new Error('Project not found')

    // Only the lead can delete the project
    if (project.leadId !== user._id) {
      throw new Error('Only the project lead can delete this project')
    }

    // 1. Delete all issues in project (with deep cleanup for each)
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', args.id))
      .collect()

    // Parallel processing of issues
    await Promise.all(
      issues.map(async (issue) => {
        const [comments, activity, agentLogs] = await Promise.all([
          ctx.db
            .query('comments')
            .withIndex('by_issue', q => q.eq('issueId', issue._id))
            .collect(),
          ctx.db
            .query('activityLog')
            .withIndex('by_issue', q => q.eq('issueId', issue._id))
            .collect(),
          ctx.db
            .query('agentLogs')
            .withIndex('by_issue', q => q.eq('issueId', issue._id))
            .collect(),
        ])

        // Parallel deletion of associated data
        await Promise.all([
          ...comments.map(async c => ctx.db.delete(c._id)),
          ...activity.map(async a => ctx.db.delete(a._id)),
          ...agentLogs.map(async l => ctx.db.delete(l._id)),
        ])

        // Delete the issue itself
        await ctx.db.delete(issue._id)
      }),
    )

    // 2. Delete project-wide agent logs
    const projectLogs = await ctx.db
      .query('agentLogs')
      .withIndex('by_project', q => q.eq('projectId', args.id))
      .collect()

    await Promise.all(projectLogs.map(async log => ctx.db.delete(log._id)))

    // 3. Delete project
    await ctx.db.delete(args.id)
  },
})
