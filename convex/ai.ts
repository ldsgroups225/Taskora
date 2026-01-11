'use node'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { action, internalAction } from './_generated/server'
import { AI_MODEL } from './constants'

function getGenAI() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API Key is not set')
  }
  return new GoogleGenerativeAI(apiKey)
}

/**
 * AI Agent to suggest assignments based on capacity and issue details
 */
export const suggestAssignments = internalAction({
  args: {
    issues: v.any(),
    capacity: v.any(),
  },
  handler: async (ctx, args) => {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: AI_MODEL })

    const prompt = `
      You are an AI Resource Manager.
      
      Task: Assign the following UNASSIGNED ISSUES to the available DEVELOPERS based on their current CAPACITY and workload score.
      Goal: Balance the load. Lower score means more capacity.
      
      Unassigned Issues: ${JSON.stringify(args.issues)}
      
      Developer Capacity: ${JSON.stringify(args.capacity)}
      
      Rules:
      1. Return a JSON ARRAY of objects. Each object must have:
         - "issueId": The ID of the issue
         - "assigneeId": The ID of the developer to assign to
         - "reason": A short explanation of why this assignment was chosen
      2. If an issue should not be assigned yet (e.g. low priority and everyone is busy), leave it out of the array.
      3. Distribute critical/high priority tasks to those with lowest load.
      4. Consider 'skillProfile' to match issue types to developers who have experience in that type.
      5. Output ONLY valid JSON. No markdown fencing.
    `

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanJson)
    }
    catch (e) {
      console.error('Gemini Assignment Error:', e)
      return []
    }
  },
})

/**
 * AI Agent for Backlog Grooming & Auto-assignment
 */
export const groomBacklog = action({
  args: {
    issues: v.any(),
    team: v.any(),
  },
  handler: async (ctx, args) => {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: AI_MODEL })

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
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanJson)
    }
    catch (e) {
      console.error('Gemini Grooming Error:', e)
      return { error: 'Failed to groom backlog' }
    }
  },
})
