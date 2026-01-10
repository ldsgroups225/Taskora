import { v } from 'convex/values'
import { mutation, query, action } from './_generated/server'
import { internal } from './_generated/api'

export const validateAutoAssignment = action({
  args: {},
  handler: async (ctx) => {
    // 1. Seed issues & users (via internal mutation or assuming they exist)
    // For simplicity, we trigger the agent directly
    console.log("Starting Auto-Assignment Validation...")
    await ctx.runAction(internal.agents.runAutoAssignment, {})
    return "Validation run initiated. Check server logs for AI output."
  }
})

export const ensureDevUser = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', 'dev_user_123'))
      .first()

    if (existing) return existing._id

    return await ctx.db.insert('users', {
      clerkId: 'dev_user_123',
      name: 'Alice Developer',
      email: 'alice@taskora.io',
      role: 'dev',
    })
  },
})

export const ensureDefaultUser = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('users').first()
    if (existing) return existing._id

    return await ctx.db.insert('users', {
      clerkId: 'user_2kI0fK...', // Mock clerk ID
      name: 'Default User',
      email: 'user@example.com',
      role: 'manager',
    })
  },
})

export const seedHierarchy = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get or create a project
    let project = await ctx.db.query('projects').first()
    if (!project) {
      const user = await ctx.db.query('users').first()
      if (!user) throw new Error('Need at least one user to seed')
      const projectId = await ctx.db.insert('projects', {
        name: 'Taskora Core',
        key: 'TC',
        leadId: user._id,
      })
      project = (await ctx.db.get(projectId))!
    }

    const user = await ctx.db.query('users').first()
    if (!user) throw new Error('Need at least one user to seed')

    // 2. Create Initiative
    const initiativeId = await ctx.db.insert('issues', {
      projectId: project._id,
      title: 'Taskora Alpha Launch',
      status: 'todo',
      priority: 'critical',
      type: 'initiative',
      creatorId: user._id,
      order: 1,
      properties: {},
    })

    // 3. Create Epic under Initiative
    const epicId = await ctx.db.insert('issues', {
      projectId: project._id,
      parentId: initiativeId,
      title: 'Core Engine Development',
      status: 'in_progress',
      priority: 'high',
      type: 'epic',
      creatorId: user._id,
      order: 1,
      properties: {},
    })

    // 4. Create Story under Epic
    const storyId = await ctx.db.insert('issues', {
      projectId: project._id,
      parentId: epicId,
      title: 'Implement Issue Hierarchy',
      status: 'in_review',
      priority: 'high',
      type: 'story',
      creatorId: user._id,
      order: 1,
      properties: {},
    })

    // 5. Create Subtask under Story
    const subtaskId = await ctx.db.insert('issues', {
      projectId: project._id,
      parentId: storyId,
      title: 'Write test script for hierarchy',
      status: 'done',
      priority: 'medium',
      type: 'subtask',
      creatorId: user._id,
      order: 1,
      properties: {},
    })

    return { initiativeId, epicId, storyId, subtaskId }
  },
})

export const getFullHierarchy = query({
  args: { initiativeId: v.id('issues') },
  handler: async (ctx, args) => {
    const initiative = await ctx.db.get(args.initiativeId)
    if (!initiative) return null

    const epics = await ctx.db
      .query('issues')
      .withIndex('by_parent', (q) => q.eq('parentId', args.initiativeId))
      .collect()

    const hierarchy = await Promise.all(
      epics.map(async (epic) => {
        const stories = await ctx.db
          .query('issues')
          .withIndex('by_parent', (q) => q.eq('parentId', epic._id))
          .collect()

        const storyTree = await Promise.all(
          stories.map(async (story) => {
            const subtasks = await ctx.db
              .query('issues')
              .withIndex('by_parent', (q) => q.eq('parentId', story._id))
              .collect()
            return { ...story, subtasks }
          })
        )

        return { ...epic, stories: storyTree }
      })
    )

    return { ...initiative, epics: hierarchy }
  },
})
