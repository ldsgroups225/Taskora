import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction, mutation } from './_generated/server'

export const assignTasks = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get unassigned issues
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_assignee', q => q.eq('assigneeId', undefined))
      .filter(q => q.neq(q.field('status'), 'done'))
      .collect()

    if (issues.length === 0)
      return { message: 'No unassigned tasks' }

    // 2. Get available developers
    const users = await ctx.db
      .query('users')
      .withIndex('by_clerkId') // Just get text index or scan
      .collect()

    // Filter for devs in memory for now
    const devs = users.filter(u => u.role === 'dev')

    if (devs.length === 0)
      return { message: 'No developers found' }

    // 3. Call AI action to get assignments
    // We need to schedule this or use an action if we want to wait (but mutations can't await actions directly unless using scheduler)
    // For "validation" purposes (Step 5.2), we'll do this in a test flow or action.
    // BUT, a proper agent would be an ACTION that queries DB, calls AI, then calls a MUTATION to update.

    // So let's return data for the caller (Action) to use
    return { issues, devs }
  },
})

// The actual agent execution flow
export const runAutoAssignment = internalAction({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch data via query/mutation
    const data = await ctx.runMutation((internal as any).agents.assignTasks, {}) as
      | { message: string }
      | { issues: Doc<'issues'>[], devs: Doc<'users'>[] }
    if ('message' in data) {
      console.log(data.message)
      return
    }

    const { issues, devs } = data

    // 2. Call Gemini
    const assignments = await ctx.runAction((internal as any).ai.groomBacklog, {
      issues: issues.map(i => ({ id: i._id, title: i.title, priority: i.priority })),
      team: devs.map(u => ({ id: u._id, name: u.name, role: u.role })),
    })

    console.log('AI Recommendations:', assignments)

    // 3. Apply updates (Mock implementation of applying logic)
    if (Array.isArray(assignments)) {
      await ctx.runMutation((internal as any).agents.applyAssignments, { assignments })
    }
  },
})

export const applyAssignments = mutation({
  args: { assignments: v.any() },
  handler: async (ctx, args) => {
    for (const assignment of args.assignments) {
      if (assignment.assigneeId && assignment.id) {
        await ctx.db.patch(assignment.id, { assigneeId: assignment.assigneeId })
      }
    }
  },
})
