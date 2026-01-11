import type { Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { action, internalAction, internalMutation, internalQuery, mutation, query } from './_generated/server'

export const getBacklogScoring = internalQuery({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', args.projectId))
      .filter(q => q.neq(q.field('status'), 'done'))
      .collect()

    const now = Date.now()

    return issues.map((issue) => {
      // Basic scoring algorithm
      // Critical = 100, High = 50, Medium = 20, Low = 5
      const priorityScore
        = issue.priority === 'critical'
          ? 100
          : issue.priority === 'high'
            ? 50
            : issue.priority === 'medium' ? 20 : 5

      // Age score: 1 point per day since creation
      const daysOld = Math.floor((now - issue._creationTime) / (1000 * 60 * 60 * 24))
      const ageScore = Math.min(daysOld, 50) // Cap age score at 50

      // Story points: 2 points per SP
      const complexityScore = (issue.storyPoints || 0) * 2

      // Total raw score
      const rawScore = priorityScore + ageScore + complexityScore

      return {
        ...issue,
        rawScore,
      }
    }).sort((a, b) => b.rawScore - a.rawScore)
  },
})

export const runReprioritization = internalAction({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    // 1. Get issues with raw scores
    const issues = await ctx.runQuery(internal.reprioritization.getBacklogScoring, {
      projectId: args.projectId,
    })

    if (issues.length === 0)
      return

    // 2. Ask AI to refine ranking based on raw scores and context
    const aiRankings = await ctx.runAction(internal.ai.rankBacklog, {
      issues: issues.map(i => ({
        id: i._id,
        title: i.title,
        priority: i.priority,
        rawScore: i.rawScore,
        type: i.type,
      })),
    })

    if (!Array.isArray(aiRankings) || aiRankings.length === 0) {
      console.log('AI failed to suggest rankings.')
      return
    }

    // 3. Store proposed changes in property properties.proposedOrder
    // This allows for the "Preview" UI
    await ctx.runMutation(internal.reprioritization.saveProposedRankings, {
      projectId: args.projectId,
      rankings: aiRankings,
    })
  },
})

export const saveProposedRankings = internalMutation({
  args: {
    projectId: v.id('projects'),
    rankings: v.array(v.object({
      id: v.string(),
      rank: v.number(),
      reason: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    for (const item of args.rankings) {
      const issueId = item.id as Id<'issues'>
      const issue = await ctx.db.get(issueId)
      if (issue) {
        const properties = issue.properties || {}
        await ctx.db.patch(issueId, {
          properties: {
            ...properties,
            proposedOrder: item.rank,
            reprioritizationReason: item.reason,
            lastProposedAt: Date.now(),
          },
        })
      }
    }

    // Log the event
    await ctx.db.insert('agentLogs', {
      projectId: args.projectId,
      action: 'backlog_grooming',
      result: `AI proposed new rankings for ${args.rankings.length} issues.`,
      status: 'success',
    })
  },
})

export const applyProposedRankings = mutation({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', args.projectId))
      .collect()

    const proposed = issues.filter(i => i.properties?.proposedOrder !== undefined)

    // Sort proposed items by their proposed rank
    const sorted = proposed.sort((a, b) => a.properties.proposedOrder - b.properties.proposedOrder)

    for (let i = 0; i < sorted.length; i++) {
      const issue = sorted[i]
      const oldOrder = issue.order
      const newOrder = i * 10
      const properties = { ...issue.properties }
      delete properties.proposedOrder

      await ctx.db.patch(issue._id, {
        order: newOrder,
        properties: {
          ...properties,
          aiReprioritized: true,
          lastReprioritizedAt: Date.now(),
        },
      })
    }

    // Log the application of rankings (Task 6.9)
    await ctx.db.insert('agentLogs', {
      projectId: args.projectId,
      action: 'apply_reprioritization',
      result: `Applied AI re-prioritization to ${sorted.length} issues.`,
      status: 'success',
    })

    return { updatedCount: sorted.length }
  },
})

export const getProposedRankings = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query('issues')
      .withIndex('by_project', q => q.eq('projectId', args.projectId))
      .filter(q => q.neq(q.field('status'), 'done'))
      .collect()

    return issues
      .filter(i => i.properties?.proposedOrder !== undefined)
      .sort((a, b) => a.properties.proposedOrder - b.properties.proposedOrder)
  },
})

// Public action wrapper to trigger re-prioritization from the UI
export const triggerReprioritization = action({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.reprioritization.runReprioritization, {
      projectId: args.projectId,
    })
  },
})
