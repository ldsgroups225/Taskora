'use node'
import { GoogleGenAI } from '@google/genai'
import { v } from 'convex/values'
import { action } from './_generated/server'

const API_KEY = process.env.GEMINI_API_KEY || ''
const client = new GoogleGenAI({ apiKey: API_KEY })

/**
 * AI Agent for Backlog Grooming & Auto-assignment
 */
export const groomBacklog = action({
  args: {
    issues: v.any(),
    team: v.any(),
  },
  handler: async (ctx, args) => {
    const prompt = `
      System: You are Taskora Orchestrator, an Agentic AI for project management.
      Task: Re-prioritize the following backlog and suggest assignments based on team capacity.
      
      Current Issues: ${JSON.stringify(args.issues)}
      Team Capacity: ${JSON.stringify(args.team)}
      
      Rules:
      1. Output a JSON list of issue IDs with recommended status, priority, and assigneeId.
      2. Justify re-prioritization in a 'reason' field.
      3. Return ONLY valid JSON.
    `

    try {
      const result = await client.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Using a valid model name for now
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      })

      const text = result.text
      if (!text)
        throw new Error('No text response from Gemini')

      // Basic cleanup to ensure we get JSON if Markdown fencing is used
      const jsonStr = text.replace(/```json\n?|\n?```/g, '')
      return JSON.parse(jsonStr)
    }
    catch (e) {
      console.error('Gemini Error:', e)
      return { error: 'Failed to groom backlog' }
    }
  },
})
