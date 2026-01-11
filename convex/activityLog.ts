import { v } from 'convex/values'
import { internalMutation, query } from './_generated/server'

/**
 * Log an activity event for an issue
 */
export const logActivity = internalMutation({
  args: {
    issueId: v.id('issues'),
    userId: v.id('users'),
    action: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('activityLog', {
      issueId: args.issueId,
      userId: args.userId,
      action: args.action,
      oldValue: args.oldValue,
      newValue: args.newValue,
    })
  },
})

/**
 * Get activity history for an issue
 */
export const getActivityLog = query({
  args: { issueId: v.id('issues') },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query('activityLog')
      .withIndex('by_issue', q => q.eq('issueId', args.issueId))
      .order('desc')
      .collect()

    return Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId)
        return {
          ...log,
          userName: user?.name ?? 'Unknown User',
          userAvatar: user?.avatarUrl,
        }
      }),
    )
  },
})
