import type { Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction, internalMutation, internalQuery, query } from './_generated/server'

export const getUnassignedIssues = internalQuery({
  args: { projectId: v.optional(v.id('projects')) },
  handler: async (ctx, args) => {
    // Optimization: Use by_assignee_project index if projectId is provided
    if (args.projectId) {
      return ctx.db
        .query('issues')
        .withIndex('by_assignee_project', q => q.eq('assigneeId', undefined).eq('projectId', args.projectId!))
        .filter(q => q.neq(q.field('status'), 'done'))
        .collect()
    }

    // Fallback: Get all unassigned issues across projects (careful if backlog is huge)
    return ctx.db
      .query('issues')
      .withIndex('by_assignee', q => q.eq('assigneeId', undefined))
      .filter(q => q.neq(q.field('status'), 'done'))
      .collect()
  },
})

export const getAgentLogs = query({
  args: { projectId: v.optional(v.id('projects')) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      throw new Error('Not authenticated')

    if (args.projectId) {
      return ctx.db
        .query('agentLogs')
        .withIndex('by_project', q => q.eq('projectId', args.projectId!))
        .order('desc')
        .take(20)
    }
    return ctx.db.query('agentLogs').order('desc').take(20)
  },
})

export const runAutoAssignment = internalAction({
  args: {
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, args) => {
    // 1. Get Unassigned Issues
    const issues = await ctx.runQuery(internal.agents.getUnassignedIssues, { projectId: args.projectId })

    if (issues.length === 0) {
      console.log('No unassigned issues found.')
      return
    }

    // 2. Get Developer Capacity
    const capacity = await ctx.runQuery(internal.capacity.getDeveloperCapacity, {})

    if (capacity.length === 0) {
      console.log('No developers found.')
      return
    }

    console.log(`Auto-assigning ${issues.length} issues among ${capacity.length} developers...`)

    // 3. Ask AI for Assignments
    const sortedIssues = [...issues].sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityWeight[b.priority] - priorityWeight[a.priority]
    })

    const assignments = await ctx.runAction(internal.ai.suggestAssignments, {
      issues: sortedIssues.map(i => ({
        id: i._id,
        title: i.title,
        priority: i.priority,
        storyPoints: i.storyPoints,
        type: i.type,
      })),
      capacity,
    })

    if (!Array.isArray(assignments) || assignments.length === 0) {
      console.log('No assignments suggested by AI.')
      return
    }

    // 4. Apply Assignments
    await ctx.runMutation(internal.agents.applyAssignments, { assignments })
  },
})

export const applyAssignments = internalMutation({
  args: {
    assignments: v.array(
      v.object({
        issueId: v.id('issues'),
        assigneeId: v.id('users'),
        reason: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const assignment of args.assignments) {
      const { issueId, assigneeId, reason } = assignment

      if (issueId && assigneeId) {
        const validIssueId = issueId as Id<'issues'>
        const validAssigneeId = assigneeId as Id<'users'>
        const issue = await ctx.db.get(validIssueId)

        if (!issue || issue.assigneeId !== undefined)
          continue

        // Update issue
        const properties = issue.properties || {}
        await ctx.db.patch(validIssueId, {
          assigneeId: validAssigneeId,
          properties: { ...properties, aiAssigned: true },
        })

        // Log action (Task 5.6)
        await ctx.db.insert('agentLogs', {
          projectId: issue.projectId,
          issueId: validIssueId,
          action: 'auto_assignment',
          result: `Assigned to user ${assigneeId}. Reason: ${reason}`,
          status: 'success',
        })
      }
    }
  },
})
