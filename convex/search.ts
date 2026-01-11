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

    const issuesQuery = ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', projectId))

    const issues = await issuesQuery.collect()

    // Resolve "me" assignee
    let currentUserId: string | null = null
    if (filter.assignee === 'me' && identity) {
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
        .unique()
      currentUserId = user?._id ?? null
    }

    return issues.filter((issue) => {
      if (filter.status && issue.status !== filter.status)
        return false
      if (filter.priority && issue.priority !== filter.priority)
        return false
      if (filter.type && issue.type !== filter.type)
        return false

      if (filter.assignee) {
        if (filter.assignee === 'me') {
          if (issue.assigneeId !== currentUserId)
            return false
        }
        else if (filter.assignee === 'unassigned') {
          if (issue.assigneeId !== undefined)
            return false
        }
        // General text search for assignee names would require more logic/joins
        // For now we support "me" and "unassigned" as per specs
      }

      if (filter.dateFilter) {
        const fieldVal = filter.dateFilter.field === 'created' ? issue._creationTime : issue._creationTime // Fallback for updated as we don't have it in schema yet
        if (filter.dateFilter.operator === 'before') {
          if (fieldVal >= filter.dateFilter.value)
            return false
        }
        else if (filter.dateFilter.operator === 'after') {
          if (fieldVal <= filter.dateFilter.value)
            return false
        }
      }

      if (filter.textSearch) {
        const search = filter.textSearch.toLowerCase()
        const matchTitle = issue.title.toLowerCase().includes(search)
        const matchDesc = issue.description?.toLowerCase().includes(search) ?? false
        if (!matchTitle && !matchDesc)
          return false
      }

      return true
    }).slice(0, 10) // Limit results for command menu
  },
})
