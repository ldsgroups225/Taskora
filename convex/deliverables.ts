import { v } from 'convex/values'
import { query } from './_generated/server'

/**
 * Get high-priority deliverables for the WarRoom
 */
export const getDeliverables = query({
  args: {
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    let projectId = args.projectId
    if (!projectId) {
      const firstProject = await ctx.db.query('projects').first()
      if (!firstProject)
        return []
      projectId = firstProject._id
    }

    // High priority deliverables are issues that are:
    // 1. High or Critical priority
    // 2. Not done
    // 3. Either an Initiative, Epic, or Story (or any high-level type)
    const deliverables = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', projectId))
      .filter(q =>
        q.and(
          q.neq(q.field('status'), 'done'),
          q.or(
            q.eq(q.field('priority'), 'critical'),
            q.eq(q.field('priority'), 'high'),
          ),
        ),
      )
      .take(5)

    return deliverables
  },
})
