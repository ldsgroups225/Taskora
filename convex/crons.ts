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

// Daily backlog re-prioritization at 3:00 AM UTC
crons.daily(
  'backlog grooming',
  { hourUTC: 3, minuteUTC: 0 },
  internal.reprioritization.groomAllProjects,
  {},
)

export default crons
