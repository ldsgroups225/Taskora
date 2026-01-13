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

    const userIds = [...new Set(logs.map(log => log.userId))]
    const users = await Promise.all(userIds.map(async id => ctx.db.get(id)))
    const userMap = new Map(
      users.filter((u): u is NonNullable<typeof u> => u !== null).map(u => [u._id, u]),
    )

    return logs.map((log) => {
      const user = userMap.get(log.userId)
      return {
        ...log,
        userName: user?.name ?? 'Unknown User',
        userAvatar: user?.avatarUrl,
      }
    })
  },
})
