import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'

/**
 * Get project metrics for the WarRoom dashboard
 */
export const getProjectMetrics = query({
  args: {
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      return null

    let projectId = args.projectId
    if (!projectId) {
      const firstProject = await ctx.db.query('projects').first()
      if (!firstProject)
        return null
      projectId = firstProject._id
    }

    // Attempt to fetch from optimized summary table first
    const summary = await ctx.db
      .query('project_summaries')
      .withIndex('by_project', q => q.eq('projectId', projectId))
      .unique()

    // If summary exists and is fresh (within 5 mins), use it
    if (summary && (Date.now() - summary.lastUpdated < 1000 * 60 * 5)) {
      // Still need velocity history for the chart (dynamic)
      const doneIssues = await ctx.db
        .query('issues')
        .withIndex('by_project_status', q => q.eq('projectId', projectId).eq('status', 'done'))
        .collect()

      const velocityHistory = getVelocityHistory(doneIssues)

      return {
        velocity: summary.velocityScore,
        riskCount: summary.riskCount,
        activeAgents: summary.activeAgents,
        productivity: summary.totalIssues > 0 ? Math.round((summary.doneIssues / summary.totalIssues) * 100) : 0,
        velocityHistory,
        totalIssues: summary.totalIssues,
        doneIssues: summary.doneIssues,
      }
    }

    // Fallback/Cold-start: Full calculation
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', projectId))
      .collect()

    const doneIssues = issues.filter(i => i.status === 'done')
    const velocityScore = doneIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0)
    const riskIssues = issues.filter(i => (i.priority === 'high' || i.priority === 'critical') && i.status !== 'done')
    const activeAgents = issues.filter(i => i.properties?.aiAssigned === true && i.status !== 'done').length

    return {
      velocity: velocityScore,
      riskCount: riskIssues.length,
      activeAgents,
      productivity: issues.length > 0 ? Math.round((doneIssues.length / issues.length) * 100) : 0,
      velocityHistory: getVelocityHistory(doneIssues),
      totalIssues: issues.length,
      doneIssues: doneIssues.length,
    }
  },
})

export const updateProjectSummary = internalMutation({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', args.projectId))
      .collect()

    const doneIssues = issues.filter(i => i.status === 'done')
    const velocityScore = doneIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0)
    const riskCount = issues.filter(i => (i.priority === 'high' || i.priority === 'critical') && i.status !== 'done').length
    const activeAgents = issues.filter(i => i.properties?.aiAssigned === true && i.status !== 'done').length

    const existing = await ctx.db
      .query('project_summaries')
      .withIndex('by_project', q => q.eq('projectId', args.projectId))
      .unique()

    const data = {
      projectId: args.projectId,
      velocityScore,
      riskCount,
      activeAgents,
      totalIssues: issues.length,
      doneIssues: doneIssues.length,
      lastUpdated: Date.now(),
    }

    if (existing) {
      await ctx.db.patch(existing._id, data)
    }
    else {
      await ctx.db.insert('project_summaries', data)
    }
  },
})

function getVelocityHistory(doneIssues: Doc<'issues'>[]) {
  const history = []
  const now = new Date()
  now.setHours(23, 59, 59, 999)

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  })

  for (const startTime of dates) {
    const endTime = startTime + 24 * 60 * 60 * 1000
    const dayVelocity = doneIssues
      .filter(issue => issue.completedAt && issue.completedAt >= startTime && issue.completedAt < endTime)
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0)
    history.push(dayVelocity)
  }
  return history
}
