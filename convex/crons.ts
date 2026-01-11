import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Auto-assign tasks daily at 2:00 AM UTC
crons.daily(
  'auto assignment',
  { hourUTC: 2, minuteUTC: 0 },
  internal.agents.runAutoAssignment,
  {},
)

export default crons
