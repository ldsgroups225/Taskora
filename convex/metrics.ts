import { v } from 'convex/values'
import { query } from './_generated/server'

/**
 * Get project metrics for the WarRoom dashboard
 */
export const getProjectMetrics = query({
  args: {
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    // If no project ID is provided, we could fetch metrics for the first project
    // or across all projects. For now, let's assume we need a projectId.
    let projectId = args.projectId
    if (!projectId) {
      const firstProject = await ctx.db.query('projects').first()
      if (!firstProject)
        return null
      projectId = firstProject._id
    }

    const issues = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', projectId))
      .collect()

    // 1. Velocity Score (Sum of story points for 'done' issues / time factor)
    const doneIssues = issues.filter(i => i.status === 'done')
    const totalVelocity = doneIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0)

    // 2. Risk Count (High/Critical priority issues that are not 'done')
    const riskIssues = issues.filter(i =>
      (i.priority === 'high' || i.priority === 'critical')
      && i.status !== 'done',
    )
    const riskCount = riskIssues.length

    // 3. Active Agents (Mock for now until agentLogs is implemented in Phase 2)
    // We'll return a static number or count "AI Assigned" issues if we had a marker.
    // Let's count issues that have 'ai' in their properties for now as a placeholder.
    const activeAgents = 3 // Placeholder as per design

    // 4. Productivity (Done vs Total)
    const productivity = issues.length > 0
      ? Math.round((doneIssues.length / issues.length) * 100)
      : 0

    return {
      velocity: totalVelocity,
      riskCount,
      activeAgents,
      productivity,
      totalIssues: issues.length,
      doneIssues: doneIssues.length,
    }
  },
})
