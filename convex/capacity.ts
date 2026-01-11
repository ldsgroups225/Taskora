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
        const issues = await ctx.db
          .query('issues')
          .withIndex('by_assignee', q => q.eq('assigneeId', dev._id))
          .collect()

        // Filter for active work (Todo, In Progress, In Review)
        const activeIssues = issues.filter(i =>
          i.status === 'todo' || i.status === 'in_progress' || i.status === 'in_review',
        )

        const activeCount = activeIssues.length
        const totalStoryPoints = activeIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0)

        // Calculate a score (Task Count * 1 + SP * 0.5) - Simple heuristic
        // Lower score = More capacity
        const loadScore = activeCount + (totalStoryPoints * 0.5)

        // Calculate skill profile based on completed tasks
        const completedIssues = issues.filter(i => i.status === 'done')
        const skillProfile: Record<string, number> = {}

        for (const issue of completedIssues) {
          const type = issue.type
          skillProfile[type] = (skillProfile[type] || 0) + 1
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
