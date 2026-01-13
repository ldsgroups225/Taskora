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

    // 3. Active Agents (Count issues currently assigned by AI that are in progress)
    const activeAgents = issues.filter(i =>
      i.properties?.aiAssigned === true
      && i.status !== 'done',
    ).length

    // 4. Productivity (Done vs Total)
    const productivity = issues.length > 0
      ? Math.round((doneIssues.length / issues.length) * 100)
      : 0

    // 5. Velocity History (Last 7 days)
    const velocityHistory = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dailyDone = issues.filter((issue) => {
        if (issue.status !== 'done' || !issue.completedAt)
          return false
        return issue.completedAt >= date.getTime() && issue.completedAt < nextDate.getTime()
      })

      const dayVelocity = dailyDone.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0)
      velocityHistory.push(dayVelocity)
    }

    return {
      velocity: totalVelocity,
      riskCount,
      activeAgents,
      productivity,
      velocityHistory,
      totalIssues: issues.length,
      doneIssues: doneIssues.length,
    }
  },
})
