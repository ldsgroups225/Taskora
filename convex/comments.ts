import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Add a comment to an issue
 */
export const addComment = mutation({
  args: {
    issueId: v.id('issues'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .unique()

    if (!user) {
      throw new Error('User not found')
    }

    const commentId = await ctx.db.insert('comments', {
      issueId: args.issueId,
      authorId: user._id,
      content: args.content,
    })

    return commentId
  },
})

/**
 * List comments for an issue, ordered by creation time
 */
export const listComments = query({
  args: { issueId: v.id('issues') },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_issue', q => q.eq('issueId', args.issueId))
      .collect()

    // Enrich with author name and avatar
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId)
        return {
          ...comment,
          authorName: author?.name ?? 'Unknown User',
          authorAvatar: author?.avatarUrl,
        }
      }),
    )

    return enrichedComments
  },
})

/**
 * Delete a comment (only by author)
 */
export const deleteComment = mutation({
  args: { id: v.id('comments') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const comment = await ctx.db.get(args.id)
    if (!comment) {
      throw new Error('Comment not found')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', q => q.eq('clerkId', identity.subject))
      .unique()

    if (!user || comment.authorId !== user._id) {
      throw new Error('Not authorized to delete this comment')
    }

    await ctx.db.delete(args.id)
  },
})
