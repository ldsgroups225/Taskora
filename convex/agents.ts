import type { Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction, internalMutation, internalQuery, query } from './_generated/server'

export const getUnassignedIssues = internalQuery({
  args: { projectId: v.optional(v.id('projects')) },
  handler: async (ctx, args) => {
    // 1. Get unassigned issues
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_assignee', q => q.eq('assigneeId', undefined))
      .filter(q => q.neq(q.field('status'), 'done'))
      .collect()

    // 2. Filter by project if needed
    if (args.projectId) {
      return issues.filter(i => i.projectId === args.projectId)
    }
    return issues
  },
})

export const getAgentLogs = query({
  args: { projectId: v.optional(v.id('projects')) },
  handler: async (ctx, args) => {
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
    const assignments = await ctx.runAction(internal.ai.suggestAssignments, {
      issues: issues.map(i => ({
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
  args: { assignments: v.any() },
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
