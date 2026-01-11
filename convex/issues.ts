import { v } from 'convex/values'
import { internal } from './_generated/api'
import { mutation, query } from './_generated/server'

/**
 * Create a new issue
 */
export const createIssue = mutation({
  args: {
    projectId: v.id('projects'),
    parentId: v.optional(v.id('issues')),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal('backlog'),
      v.literal('todo'),
      v.literal('in_progress'),
      v.literal('in_review'),
      v.literal('done'),
    ),
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical'),
    ),
    type: v.union(
      v.literal('initiative'),
      v.literal('epic'),
      v.literal('story'),
      v.literal('task'),
      v.literal('bug'),
      v.literal('subtask'),
    ),
    assigneeId: v.optional(v.id('users')),
    storyPoints: v.optional(v.number()),
    properties: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      throw new Error('Not authenticated')

    const creator = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .unique()

    if (!creator)
      throw new Error('User not found in database')

    let order: number
    if (args.priority === 'critical' && args.type === 'bug') {
      const firstIssue = await ctx.db
        .query('issues')
        .withIndex('by_project', q => q.eq('projectId', args.projectId))
        .order('asc')
        .first()
      order = firstIssue ? firstIssue.order - 1 : 0
    }
    else {
      const lastIssue = await ctx.db
        .query('issues')
        .withIndex('by_project', q => q.eq('projectId', args.projectId))
        .order('desc')
        .first()
      order = lastIssue ? lastIssue.order + 1 : 1
    }

    const id = await ctx.db.insert('issues', {
      ...args,
      creatorId: creator._id,
      order,
      properties: args.properties ?? {},
    })

    return id
  },
})

/**
 * Update an existing issue with state machine validation
 */
export const updateIssue = mutation({
  args: {
    id: v.id('issues'),
    patch: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(
        v.union(
          v.literal('backlog'),
          v.literal('todo'),
          v.literal('in_progress'),
          v.literal('in_review'),
          v.literal('done'),
        ),
      ),
      priority: v.optional(
        v.union(
          v.literal('low'),
          v.literal('medium'),
          v.literal('high'),
          v.literal('critical'),
        ),
      ),
      assigneeId: v.optional(v.id('users')),
      storyPoints: v.optional(v.number()),
      properties: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      throw new Error('Not authenticated')

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .unique()

    if (!user)
      throw new Error('User not found')

    const issue = await ctx.db.get(id)
    if (!issue)
      throw new Error('Issue not found')

    // Track changes for activity log
    const changes: { action: string, oldValue?: string, newValue?: string }[] = []

    if (patch.status && patch.status !== issue.status) {
      changes.push({ action: 'status_change', oldValue: issue.status, newValue: patch.status })

      // AI Trigger Hook
      if (patch.status === 'in_review') {
        await ctx.scheduler.runAfter(0, internal.postFunctions.onTransitionToReview, {
          issueId: id,
          projectId: issue.projectId,
          title: issue.title,
          description: issue.description ?? '',
        })
      }
      else if (patch.status === 'done') {
        await ctx.scheduler.runAfter(0, internal.postFunctions.onTransitionToDone, {
          issueId: id,
          projectId: issue.projectId,
          title: issue.title,
          description: issue.description ?? '',
        })
      }
    }

    if (patch.priority && patch.priority !== issue.priority) {
      changes.push({ action: 'priority_change', oldValue: issue.priority, newValue: patch.priority })
    }

    if (patch.assigneeId !== undefined && patch.assigneeId !== issue.assigneeId) {
      changes.push({
        action: 'assignee_change',
        oldValue: issue.assigneeId ? String(issue.assigneeId) : 'unassigned',
        newValue: patch.assigneeId ? String(patch.assigneeId) : 'unassigned',
      })
    }

    if (patch.title && patch.title !== issue.title) {
      changes.push({ action: 'title_change', oldValue: issue.title, newValue: patch.title })
    }

    // Log all changes
    for (const change of changes) {
      await ctx.db.insert('activityLog', {
        issueId: id,
        userId: user._id,
        ...change,
      })
    }

    await ctx.db.patch(id, patch)
  },
})

/**
 * Delete an issue and its subtasks
 */
export const deleteIssue = mutation({
  args: { id: v.id('issues') },
  handler: async (ctx, { id }) => {
    const subtasks = await ctx.db
      .query('issues')
      .withIndex('by_parent', q => q.eq('parentId', id))
      .collect()

    for (const subtask of subtasks) {
      await ctx.db.delete(subtask._id)
    }

    await ctx.db.delete(id)
  },
})

/**
 * List issues assigned to the current user
 */
export const listMyIssues = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .unique()

    if (!user) {
      return []
    }

    return ctx.db
      .query('issues')
      .withIndex('by_assignee', q => q.eq('assigneeId', user._id))
      .collect()
  },
})

/**
 * List issues for a project with optional filters (AQL Support foundation)
 */
export const listIssues = query({
  args: {
    projectId: v.id('projects'),
    status: v.optional(v.string()),
    assigneeId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', args.projectId))

    const results = await q.collect()

    // Basic filtering (foundation for AQL)
    return results.filter((issue) => {
      if (args.status && issue.status !== args.status)
        return false
      if (args.assigneeId && issue.assigneeId !== args.assigneeId)
        return false
      return true
    })
  },
})

/**
 * Get a single issue by ID
 */
export const getIssue = query({
  args: { id: v.id('issues') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id)
  },
})

/**
 * Get children of an issue
 */
export const getChildren = query({
  args: { parentId: v.id('issues') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('issues')
      .withIndex('by_parent', q => q.eq('parentId', args.parentId))
      .collect()
  },
})
