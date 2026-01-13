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
    issues: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        priority: v.string(),
        storyPoints: v.optional(v.number()),
        type: v.string(),
      }),
    ),
    capacity: v.array(
      v.object({
        _id: v.string(),
        name: v.string(),
        role: v.string(),
        activeCount: v.number(),
        totalStoryPoints: v.number(),
        loadScore: v.number(),
        skillProfile: v.record(v.string(), v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const genAI = getGenAI()
    // Using a deterministic temperature for mapping tasks
    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    })

    const prompt = `
      System: You are the Taskora Strategic Resource Allocator, a specialist in operational efficiency and team load balancing.

      Context: You are managing the assignment of unassigned issues to developers. Your objective is to maximize throughput while maintaining developer health by balancing load scores and matching skills.

      Data:
      - UNASSIGNED ISSUES: ${JSON.stringify(args.issues, null, 2)}
      - DEVELOPER POOLS: ${JSON.stringify(args.capacity, null, 2)}

      Constraints:
      1. IDENTITIES: You MUST ONLY assign issues/users provided in the data above. Do NOT invent new IDs.
      2. LOAD LIMITS: Prioritize developers with the lowest 'loadScore'. 
      3. STRATEGIC MATCHING: Use 'skillProfile' to align 'issue.type' (e.g., bug, story) with developer experience.
      4. PRIORITY OVERFLOW: Distribute 'critical' and 'high' issues first. Avoid stacking more than two 'critical' tasks on a single developer unless necessary.
      5. OPTIONALITY: If all viable developers exceed a healthy load threshold (e.g., loadScore > 15), you may leave lower priority tasks unassigned.

      Process (Think Step-by-Step):
      1. Rank UNASSIGNED ISSUES by priority (Critical > High > Medium > Low).
      2. For each issue, identify 2 potential candidates based on skillProfile and lowest current loadScore.
      3. Make final selection and calculate the hypothetical new loadScore for that developer.

      Output Format:
      Return ONLY a valid JSON array of objects. No markdown, no "here is your JSON", just the array.
      Each object must follow this schema:
      {
        "issueId": string,
        "assigneeId": string,
        "reason": string (A professional, strategic justification citing specific skill-match or load balancing metrics)
      }

      Example Reason: "Assigned [Issue Title] to [Dev Name] due to their extensive experience with 'bug' type tasks and their current low loadScore (2.5), which allows them to handle this high-priority item without bottlenecking."
    `

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      // With responseMimeType: "application/json", text should be pure JSON
      return JSON.parse(text)
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
    issues: v.array(v.any()),
    team: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      throw new Error('Not authenticated')

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    })

    const prompt = `
      System: You are Taskora Orchestrator, an Agentic AI for project management.
      Task: Re-prioritize the following backlog and suggest assignments based on team capacity.
      
      Current Issues: ${JSON.stringify(args.issues, null, 2)}
      Team Capacity: ${JSON.stringify(args.team, null, 2)}
      
      Rules:
      1. Output a JSON list of objects. Each object must have issueId, status, priority, and assigneeId.
      2. Justify re-prioritization in a 'reason' field.
      3. Use your reasoning to detect bottlenecks (e.g., too many bugs) and suggest redistribution.
      4. Return ONLY valid JSON.
    `

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      return JSON.parse(text)
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
    issues: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        priority: v.string(),
        rawScore: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    })

    const prompt = `
      System: You are the Taskora Chief Product Officer AI.
      
      Context: Review a backlog ranking. Use 'rawScore' (Priority, Age, Complexity) as a guide, but apply strategic product judgment.
      
      Task: Provide a final numeric Ranking (1 is top priority).
      
      Input Issues: ${JSON.stringify(args.issues, null, 2)}
      
      Requirements:
      1. Return a JSON ARRAY of objects. Each object must have:
         - "id": id of the issue
         - "rank": numeric rank (1, 2, 3...)
         - "reason": strategic justification
      2. Ensure ranks are unique and sequential.
      3. Return ONLY valid JSON.
    `

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      return JSON.parse(text)
    }
    catch (e) {
      console.error('Gemini Ranking Error:', e)
      return []
    }
  },
})

/**
 * Generate a context-aware suggestion for a specific task
 */
export const generateTaskSuggestion = action({
  args: {
    issueId: v.id('issues'),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity)
      throw new Error('Not authenticated')

    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: AI_MODEL })

    const prompt = `
      You are an expert Agile Project Manager and AI Orchestrator.
      Analyze the following task and provide a single, concise, strategic suggestion (max 2 sentences).
      
      Task: "${args.title}"
      Type: ${args.type}
      Status: ${args.status}
      Priority: ${args.priority}
      Description: "${args.description || 'No description provided'}"
      
      Your goal is to suggest the most impactful next step.
      Examples:
      - If it's a bug & critical, suggest immediate assignment or reproduction.
      - If it's a vague story, suggest breaking it down.
      - If it's in progress for a long time, ask for an update.
      - If it's done, suggest a review or closing related tickets.
      
      Output ONLY the suggestion text, no conversational filler.
    `

    try {
      const result = await model.generateContent(prompt)
      let text = result.response.text().trim()
      // Fallback if empty
      if (!text) {
        text = 'Review this task\'s priority and ensure the description is up to date.'
      }
      return { suggestion: text }
    }
    catch (e) {
      console.error('Gemini Suggestion Error:', e)
      return { suggestion: 'Unable to generate suggestion at this time. Please check task details.' }
    }
  },
})
