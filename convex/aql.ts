'use node'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { v } from 'convex/values'
import { action } from './_generated/server'
import { AI_MODEL } from './constants'

function getGenAI() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API Key is not set')
  }
  return new GoogleGenerativeAI(apiKey)
}

/**
 * AI Agent for Natural Language Query Parsing (AQL)
 */
export const parseNaturalLanguageQuery = action({
  args: {
    input: v.string(),
  },
  handler: async (ctx, args) => {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ model: AI_MODEL })

    const prompt = `
      System: You are Taskora AQL (Agentic Query Language) Parser.
      Task: Transform the following natural language query into a structured JSON filter for Taskora issues.
      
      Query: "${args.input}"
      
      JSON Schema:
      {
        "status": "backlog" | "todo" | "in_progress" | "in_review" | "done",
        "priority": "low" | "medium" | "high" | "critical",
        "type": "initiative" | "epic" | "story" | "task" | "bug" | "subtask",
        "assignee": "me" | "unassigned" | string (name/email),
        "dateFilter": {
          "field": "created" | "updated",
          "operator": "before" | "after",
          "value": number (timestamp in ms)
        },
        "textSearch": string (title/description keywords),
        "explanation": string (simple explanation of what is being filtered)
      }
      
      Rules:
      1. Map synonyms correctly (e.g., "completed" -> status: "done", "urgent" -> priority: "critical").
      2. If the user mentions "me" or "my", set assignee to "me".
      3. For time filters like "last 3 days", calculate the timestamp based on current time: ${Date.now()}.
      4. If a field is not mentioned, leave it out of the JSON.
      5. Output ONLY valid JSON.
    `

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim()
      return JSON.parse(cleanJson)
    }
    catch (e) {
      console.error('AQL Parsing Error:', e)
      return { error: 'Failed to parse natural language' }
    }
  },
})
