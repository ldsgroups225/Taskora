import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'
import { query } from './_generated/server'

/**
 * Execute a structured AQL query and return results
 */
export const executeAqlQuery = query({
  args: {
    projectId: v.id('projects'),
    filter: v.object({
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      type: v.optional(v.string()),
      assignee: v.optional(v.string()),
      dateFilter: v.optional(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.number(),
      })),
      textSearch: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { projectId, filter } = args
    const identity = await ctx.auth.getUserIdentity()

    let issues: Doc<'issues'>[]
    if (filter.textSearch) {
      // Use efficient database-level full-text search
      const searchQ = ctx.db
        .query('issues')
        .withSearchIndex('search_title_description', (q) => {
          let builder = q.search('title', filter.textSearch!).eq('projectId', projectId)
          if (filter.type)
            builder = builder.eq('type', filter.type as 'initiative' | 'epic' | 'story' | 'task' | 'bug' | 'subtask')
          if (filter.priority)
            builder = builder.eq('priority', filter.priority as 'low' | 'medium' | 'high' | 'critical')
          return builder
        })
      issues = await searchQ.collect()
    }
    else {
      // Standard project-based scan (fallback)
      issues = await ctx.db
        .query('issues')
        .withIndex('by_project', q => q.eq('projectId', projectId))
        .collect()
    }

    // Resolve "me" assignee for filtering
    let currentUserId: string | null = null
    if (filter.assignee === 'me' && identity) {
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
        .unique()
      currentUserId = user?._id ?? null
    }

    return issues.filter((issue) => {
      // Remaining filters that are not yet indexed
      if (filter.status && issue.status !== filter.status)
        return false

      // type and priority are already handled in searchQ if textSearch was used,
      // but if not, we filter here.
      if (!filter.textSearch) {
        if (filter.priority && issue.priority !== filter.priority)
          return false
        if (filter.type && issue.type !== filter.type)
          return false
      }

      if (filter.assignee) {
        if (filter.assignee === 'me') {
          if (issue.assigneeId !== currentUserId)
            return false
        }
        else if (filter.assignee === 'unassigned') {
          if (issue.assigneeId !== undefined)
            return false
        }
      }

      if (filter.dateFilter) {
        const fieldVal = issue._creationTime
        if (filter.dateFilter.operator === 'before') {
          if (fieldVal >= filter.dateFilter.value)
            return false
        }
        else if (filter.dateFilter.operator === 'after') {
          if (fieldVal <= filter.dateFilter.value)
            return false
        }
      }

      return true
    }).slice(0, 10)
  },
})
