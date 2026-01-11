import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalAction, internalMutation } from './_generated/server'
import { AI_MODEL } from './constants'

function getGenAI() {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not set')
  }
  return new GoogleGenerativeAI(apiKey)
}

export const logAgentAction = internalMutation({
  args: {
    projectId: v.id('projects'),
    issueId: v.optional(v.id('issues')),
    action: v.string(),
    result: v.string(),
    status: v.union(v.literal('pending'), v.literal('success'), v.literal('failed')),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('agentLogs', args)
  },
})

export const updateIssueAiProperties = internalMutation({
  args: {
    issueId: v.id('issues'),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId)
    if (!issue)
      return
    const properties = issue.properties || {}
    await ctx.db.patch(args.issueId, {
      properties: { ...properties, ...args.patch },
    })
  },
})

export const onTransitionToReview = internalAction({
  args: {
    issueId: v.id('issues'),
    projectId: v.id('projects'),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const genAI = getGenAI()
      const model = genAI.getGenerativeModel({ model: AI_MODEL })

      const prompt = `You are an AI code reviewer.
Issue Title: ${args.title}
Issue Description: ${args.description}

Please generate a structured code review summary checklist for this issue. Focus on what should be verified.`

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      await ctx.runMutation(internal.postFunctions.logAgentAction, {
        projectId: args.projectId,
        issueId: args.issueId,
        action: 'review_summary',
        result: text,
        status: 'success',
      })

      await ctx.runMutation(internal.postFunctions.updateIssueAiProperties, {
        issueId: args.issueId,
        patch: { aiReviewSummary: text },
      })
    }
    catch (e: any) {
      await ctx.runMutation(internal.postFunctions.logAgentAction, {
        projectId: args.projectId,
        issueId: args.issueId,
        action: 'review_summary',
        result: '',
        status: 'failed',
        error: e.message || 'Unknown error',
      })
    }
  },
})

export const onTransitionToDone = internalAction({
  args: {
    issueId: v.id('issues'),
    projectId: v.id('projects'),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const genAI = getGenAI()
      const model = genAI.getGenerativeModel({ model: AI_MODEL })

      const prompt = `You are an AI project manager.
The following issue has just been completed:
Title: ${args.title}
Description: ${args.description}

Generate a short impact summary celebrating this achievement and noting its potential value.`

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      await ctx.runMutation(internal.postFunctions.logAgentAction, {
        projectId: args.projectId,
        issueId: args.issueId,
        action: 'impact_summary',
        result: text,
        status: 'success',
      })

      await ctx.runMutation(internal.postFunctions.updateIssueAiProperties, {
        issueId: args.issueId,
        patch: { aiImpactSummary: text },
      })
    }
    catch (e: any) {
      await ctx.runMutation(internal.postFunctions.logAgentAction, {
        projectId: args.projectId,
        issueId: args.issueId,
        action: 'impact_summary',
        result: '',
        status: 'failed',
        error: e.message || 'Unknown error',
      })
    }
  },
})
