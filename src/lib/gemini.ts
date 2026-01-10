import { GoogleGenAI } from '@google/genai'

const API_KEY = process.env.GEMINI_API_KEY || ''
const client = new GoogleGenAI({ apiKey: API_KEY })

/**
 * Re-prioritizes a backlog and suggests assignees based on team capacity.
 *
 * @param issues - Array of issue objects to be evaluated (each should include an `id` and relevant metadata).
 * @param context - Context object containing team capacity and related scheduling information (e.g., `team`).
 * @returns The AI response text containing a JSON-formatted list of recommendations: entries with `id`, recommended `status`, `priority`, `assigneeId`, and a `reason` for the change.
 */
export async function groomBacklog(issues: any[], context: any) {
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
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })
  return result.text
}

/**
 * Analyze an issue and its code diff to produce a review summary, risk analysis, and readiness sentiment.
 *
 * Sends the issue title and provided diff to the AI model and requests three outputs: a summary of changes,
 * potential risks or missing tests, and a sentiment indicating "Ready" or "Needs Work".
 *
 * @param issue - Issue object; its `title` is used in the analysis prompt.
 * @param codeDiff - The code changes or unified diff text to be analyzed.
 * @returns The raw text response from the AI containing the summary, risks/missing tests, and sentiment. 
 */
export async function analyzeReviewRequest(issue: any, codeDiff: string) {
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
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })
  return result.text
}

/**
 * Convert a natural-language query into a Taskora AQL JSON filter.
 *
 * @param query - A natural-language description of the desired issue filter (e.g., criteria for status, priority, type, or assignee).
 * @returns A parsed JSON filter object suitable for Taskora on success; otherwise an object with an `error` string (`'No response from AI'` or `'Failed to parse AQL'`).
 */
export async function parseAQL(query: string) {
  const prompt = `
    Transform the following natural language query into a structured JSON filter for Taskora issues.
    Query: "${query}"
    
    Fields available: status, priority, type, assigneeName.
    Output JSON only.
  `

  const result = await client.models.generateContent({
    model: 'gemini-2.0-flash',
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