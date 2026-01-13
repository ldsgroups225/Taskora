import { internalQuery } from './_generated/server'

export const getDeveloperCapacity = internalQuery({
  args: {},
  handler: async (ctx) => {
    // 1. Get all developers
    const developers = await ctx.db
      .query('users')
      .collect()

    const devs = developers.filter(u => u.role === 'dev')

    // 2. Calculate capacity for each developer
    const capacityData = await Promise.all(
      devs.map(async (dev) => {
        // Fetch active statuses in parallel using the new specialist index
        const [todo, inProgress, inReview, done] = await Promise.all([
          ctx.db.query('issues').withIndex('by_assignee_status', q => q.eq('assigneeId', dev._id).eq('status', 'todo')).collect(),
          ctx.db.query('issues').withIndex('by_assignee_status', q => q.eq('assigneeId', dev._id).eq('status', 'in_progress')).collect(),
          ctx.db.query('issues').withIndex('by_assignee_status', q => q.eq('assigneeId', dev._id).eq('status', 'in_review')).collect(),
          ctx.db.query('issues').withIndex('by_assignee_status', q => q.eq('assigneeId', dev._id).eq('status', 'done')).take(50), // Only need recent done for skill profile
        ])

        const activeIssues = [...todo, ...inProgress, ...inReview]
        const activeCount = activeIssues.length
        const totalStoryPoints = activeIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0)

        // Load Score: Balanced heuristic for capacity assessment
        const loadScore = activeCount + (totalStoryPoints * 0.5)

        const skillProfile: Record<string, number> = {}
        for (const issue of done) {
          skillProfile[issue.type] = (skillProfile[issue.type] || 0) + 1
        }

        return {
          _id: dev._id,
          name: dev.name,
          role: dev.role,
          activeCount,
          totalStoryPoints,
          loadScore,
          skillProfile, // Pass this to AI
        }
      }),
    )

    return capacityData.sort((a, b) => a.loadScore - b.loadScore)
  },
})
