import { GoogleGenAI } from '@google/genai'
import { AI_MODEL } from './constants'

const API_KEY = process.env.GEMINI_API_KEY || ''
const client = new GoogleGenAI({ apiKey: API_KEY })

interface Issue {
  _id: string
  title: string
  priority: string
  storyPoints?: number
  type: string
}

interface Capacity {
  team: {
    _id: string
    name: string
    loadScore: number
  }[]
}

/**
 * AI Agent for Backlog Grooming & Auto-assignment
 */
export async function groomBacklog(issues: Issue[], context: Capacity) {
  const prompt = `
    System: You are Taskora Orchestrator, an Agentic AI for project management.
    Task: Re-prioritize the following backlog and suggest assignments based on team capacity.
    
    Current Issues: ${JSON.stringify(issues)}
    Team Capacity: ${JSON.stringify(context.team)}
    
    Rules:
    1. Output a JSON list of issue IDs with recommended status, priority, and assigneeId.
    2. Justify re-prioritization in a 'reason' field.
  `

  const result = await client.models.generateContent({
    model: AI_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })
  return result.text
}

/**
 * AI Post-Function: Analyze Review
 */
export async function analyzeReviewRequest(issue: Issue, codeDiff: string) {
  const prompt = `
    Analyze the following issue and code changes for 'In Review' transition.
    Issue: ${issue.title}
    Diff: ${codeDiff}
    
    Output:
    1. Summary of changes.
    2. Potential risks or missing tests.
    3. Sentiment (Ready / Needs Work).
  `

  const result = await client.models.generateContent({
    model: AI_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })
  return result.text
}

/**
 * AQL Parser: Transform natural language to query filters
 */
export async function parseAQL(query: string) {
  const prompt = `
    Transform the following natural language query into a structured JSON filter for Taskora issues.
    Query: "${query}"
    
    Fields available: status, priority, type, assigneeName.
    Output JSON only.
  `

  const result = await client.models.generateContent({
    model: AI_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  const text = result.text
  if (!text)
    return { error: 'No response from AI' }

  try {
    return JSON.parse(text)
  }
  catch {
    return { error: 'Failed to parse AQL' }
  }
}
