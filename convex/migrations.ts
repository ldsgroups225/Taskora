import { internal } from './_generated/api'
import { mutation } from './_generated/server'

export default mutation({
  args: {},
  handler: async (ctx) => {
    const issues = await ctx.db.query('issues').collect()
    let count = 0
    for (const issue of issues) {
      if (!issue.generatedPrompt) {
        // Stagger by 15s to stay within Free Tier limits (5 RPM)
        await ctx.scheduler.runAfter(count * 15000, internal.postFunctions.generateIssuePrompt, {
          issueId: issue._id,
          title: issue.title,
          description: issue.description,
          type: issue.type,
          priority: issue.priority,
        })
        count++
      }
    }
    return { scheduled: count }
  },
})
