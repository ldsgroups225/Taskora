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

/**
 * AI Agent to rank backlog items based on score and strategic context
 */
export const rankBacklog = internalAction({
  args: {
    issues: v.any(),
  },
  handler: async (ctx, args) => {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      You are the Taskora Chief Product Officer AI.
      
      Task: Review the current backlog ranking and provide a refined list of priorities.
      I have provided a 'rawScore' based on basic metrics (Priority, Age, Complexity). 
      Your job is to provide the final relative Ranking (1 is top priority).
      
      Input Issues: ${JSON.stringify(args.issues)}
      
      Rules:
      1. Return a JSON ARRAY of objects. Each object must have:
         - "id": The ID of the issue
         - "rank": The final suggested numeric rank (1, 2, 3...)
         - "reason": A one-sentence strategic justification
      2. High rawScore usually means higher rank, but use your judgment (e.g., if a Bug has been sitting for too long, rank it higher).
      3. Output ONLY valid JSON.
    `

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanJson)
    }
    catch (e) {
      console.error('Gemini Ranking Error:', e)
      return []
    }
  },
})
