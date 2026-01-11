# Taskora Completion - Implementation Tasks

## Relevant Files

### Authentication

- `src/routes/__root.tsx` - Root layout, add Clerk provider and auth guards
- `convex/auth.ts` - New file for Clerk-Convex authentication sync
- `convex/users.ts` - New file for user CRUD operations
- `src/routes/sign-in.tsx` - New file for sign-in page
- `src/routes/sign-up.tsx` - New file for sign-up page
- `src/routes/onboarding.tsx` - New file for role selection onboarding

### Data Integration

- `src/components/ZenMode.tsx` - Replace mock data with real Convex queries
- `src/components/WarRoom.tsx` - Replace mock data with real Convex queries
- `src/hooks/useCurrentUser.ts` - New hook for current authenticated user
- `src/hooks/useProjectMetrics.ts` - New hook for project velocity/risk metrics
- `convex/metrics.ts` - New file for metrics calculations (velocity, risk)

### AI Agents

- `convex/ai.ts` - Extend with more AI functions
- `convex/agents.ts` - Extend with complete agent logic
- `convex/postFunctions.ts` - New file for AI post-function triggers
- `convex/crons.ts` - Update with scheduled agent jobs
- `convex/schema.ts` - Add agentLogs and comments tables

### AQL (Agentic Query Language)

- `convex/aql.ts` - New file for AQL parsing and execution
- `src/components/CommandMenu.tsx` - Integrate AQL query execution

### User & Project Management

- `convex/projects.ts` - New file for project CRUD
- `src/routes/settings.projects.tsx` - New file for project management UI
- `src/routes/settings.team.tsx` - New file for team management UI
- `src/components/ProjectForm.tsx` - New component for create/edit project
- `src/components/UserInvite.tsx` - New component for inviting users

### Issue Enhancements

- `src/routes/tasks.$taskId.tsx` - Enhance with comments, activity log, AI summaries
- `convex/comments.ts` - New file for comments CRUD
- `convex/activityLog.ts` - New file for activity tracking
- `src/components/IssueComments.tsx` - New component for comments thread
- `src/components/IssueActivity.tsx` - New component for activity timeline

### Contextual UI

- `src/context/ViewModeContext.tsx` - New context for role-based view mode
- `src/components/ViewModeToggle.tsx` - New component for ZenMode/WarRoom toggle

### Notes

- This project uses **TanStack Start** for routing and **Convex** for the backend.
- AI features use **Gemini 2.5 Flash** via the `@google/genai` SDK.
- Authentication uses **Clerk** integrated with Convex.
- Run `pnpm dev` to start the development server.
- Run `npx convex dev` to start Convex development mode.

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

### Phase 1: Foundation (Weeks 1-2)

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch: `git checkout -b feature/taskora-completion`

- [x] 1.0 Implement Clerk Authentication Integration
  - [x] 1.1 Install Clerk packages: `pnpm add @clerk/tanstack-start @clerk/clerk-react`
  - [x] 1.2 Add `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`
  - [x] 1.3 Create `src/routes/sign-in.tsx` with Clerk `<SignIn />` component
  - [x] 1.4 Create `src/routes/sign-up.tsx` with Clerk `<SignUp />` component
  - [x] 1.5 Wrap app with `<ClerkProvider>` in `src/routes/__root.tsx`
  - [x] 1.6 Add authentication middleware to protect routes (redirect unauthenticated users to sign-in)
  - [x] 1.7 Create `convex/auth.ts` with webhook handler for Clerk user sync
  - [x] 1.8 Update `convex/issues.ts` to resolve `creatorId` from `identity.subject` instead of first user
  - [x] 1.9 Create `src/hooks/useCurrentUser.ts` hook that fetches user from Convex by clerkId
  - [x] 1.10 Create `src/routes/onboarding.tsx` for first-time role selection (dev/manager)
  - [x] 1.11 Add route guard to redirect users without role to onboarding

- [x] 2.0 Connect Real Data to UI Components
  - [x] 2.1 Create `src/hooks/useMyTasks.ts` hook that fetches issues assigned to current user
  - [x] 2.2 Update `ZenMode.tsx` to use `useMyTasks` instead of `mockTasks`
  - [x] 2.3 Add loading and empty states to ZenMode
  - [x] 2.4 Create `convex/metrics.ts` with queries for velocity score, risk count, and active agents
  - [x] 2.5 Create `src/hooks/useProjectMetrics.ts` hook to fetch dashboard metrics
  - [x] 2.6 Update `WarRoom.tsx` to use real metrics from `useProjectMetrics`
  - [x] 2.7 Add real-time subscription using Convex `useQuery` for live updates
  - [x] 2.8 Create `convex/deliverables.ts` query for high-priority deliverables list
  - [x] 2.9 Update WarRoom deliverables section to use real data
  - [x] 2.10 Add loading skeletons to WarRoom cards

- [x] 3.0 Create User & Project Management
  - [x] 3.1 Create `convex/projects.ts` with `createProject`, `updateProject`, `deleteProject`, `listProjects` functions
  - [x] 3.2 Create `convex/users.ts` with `updateUserRole`, `listUsers`, `inviteUser` functions
  - [x] 3.3 Create `src/routes/settings.tsx` as layout for settings pages
  - [x] 3.4 Create `src/routes/settings.projects.tsx` with project list and CRUD UI
  - [x] 3.5 Create `src/components/ProjectForm.tsx` dialog for create/edit project
  - [x] 3.6 Create `src/routes/settings.team.tsx` with team member list
  - [x] 3.7 Create `src/components/UserInvite.tsx` dialog to invite new team members
  - [x] 3.8 Add navigation links to settings pages in the app header/sidebar
  - [x] 3.9 Implement project selection dropdown in header for multi-project support
  - [x] 3.10 Store selected project ID in URL or context

---

### Phase 2: AI Core (Weeks 3-4)

- [x] 4.0 Implement AI Post-Functions (Workflow Triggers)
  - [x] 4.1 Update `convex/schema.ts` to add `agentLogs` table for AI audit trail
  - [x] 4.2 Create `convex/postFunctions.ts` with internal actions for AI triggers
  - [x] 4.3 Implement `onTransitionToReview` action that calls Gemini to generate review summary
  - [x] 4.4 Implement `onTransitionToDone` action that generates impact summary
  - [x] 4.5 Update `convex/issues.ts` `updateIssue` to use `ctx.scheduler.runAfter()` for AI triggers
  - [x] 4.6 Store AI summaries in `properties.aiReviewSummary` and `properties.aiImpactSummary`
  - [x] 4.7 Create `logAgentAction` helper to record all AI actions in `agentLogs`
  - [x] 4.8 Add visual indicator (sparkle icon) in issue cards when AI content is present
  - [x] 4.9 Display AI summaries in issue detail view with expandable section

- [ ] 5.0 Build Auto-Assignment Agent
  - [ ] 5.1 Create `convex/capacity.ts` with query to calculate developer workload (open task count, story points)
  - [ ] 5.2 Update `convex/ai.ts` with `suggestAssignments` action using Gemini
  - [ ] 5.3 Update `convex/agents.ts` `runAutoAssignment` to use new capacity data
  - [ ] 5.4 Add developer skill matching based on past task types (store in user properties)
  - [ ] 5.5 Update `convex/crons.ts` to schedule auto-assignment daily at 2:00 AM UTC
  - [ ] 5.6 Log all assignment decisions with reasoning to `agentLogs`
  - [ ] 5.7 Create `src/components/AgentActivityFeed.tsx` to show recent AI actions in WarRoom
  - [ ] 5.8 Add "AI Assigned" badge to issues that were auto-assigned
  - [ ] 5.9 Allow manual override of AI assignments without breaking the system

- [ ] 6.0 Build Dynamic Re-Prioritization Agent
  - [ ] 6.1 Create `convex/reprioritization.ts` with internal action for backlog ranking
  - [ ] 6.2 Implement scoring algorithm considering: priority, age, blocking status, story points
  - [ ] 6.3 Call Gemini to enhance ranking with contextual reasoning
  - [ ] 6.4 Store AI priority reasoning in `properties.aiPriorityReason`
  - [ ] 6.5 Automatically bump `critical` bugs to top when created (immediate trigger)
  - [ ] 6.6 Update `convex/crons.ts` to schedule re-prioritization daily at 3:00 AM UTC
  - [ ] 6.7 Create "Review AI Changes" panel in WarRoom showing recent re-prioritizations
  - [ ] 6.8 Add animation when issue order changes in backlog view
  - [ ] 6.9 Log all re-prioritization actions with before/after positions

---

### Phase 3: Intelligence (Weeks 5-6)

- [ ] 7.0 Implement Natural Language Queries (AQL)
  - [ ] 7.1 Create `convex/aql.ts` with `parseNaturalLanguageQuery` action using Gemini
  - [ ] 7.2 Define AQL schema: `{ status?, priority?, assignee?, type?, dateFilter?, textSearch? }`
  - [ ] 7.3 Implement query translation: "my tasks" → `{ assignee: currentUserId }`
  - [ ] 7.4 Implement time filters: "not touched in 3 days" → `{ updatedBefore: Date.now() - 3days }`
  - [ ] 7.5 Implement priority/status filters: "critical bugs" → `{ priority: 'critical', type: 'bug' }`
  - [ ] 7.6 Create `convex/aql.ts` `executeAqlQuery` query to apply parsed filters
  - [ ] 7.7 Update `CommandMenu.tsx` to send input to AQL parser on Enter
  - [ ] 7.8 Display parsed filter interpretation below search input (e.g., "Showing: critical bugs assigned to you")
  - [ ] 7.9 Show search results in Command Menu dropdown with issue previews
  - [ ] 7.10 Add keyboard navigation (arrow keys) for search results
  - [ ] 7.11 Allow clicking result to navigate to issue detail

- [ ] 8.0 Enhance Issue Detail View
  - [ ] 8.1 Update `convex/schema.ts` to add `comments` table
  - [ ] 8.2 Create `convex/comments.ts` with `addComment`, `listComments`, `deleteComment` functions
  - [ ] 8.3 Create `src/components/IssueComments.tsx` with comment list and input form
  - [ ] 8.4 Add comments section to `tasks.$taskId.tsx` below description
  - [ ] 8.5 Create `convex/activityLog.ts` with `logActivity` mutation and `getActivityLog` query
  - [ ] 8.6 Create `src/components/IssueActivity.tsx` timeline component
  - [ ] 8.7 Log all issue state changes (status, assignee, priority) as activity entries
  - [ ] 8.8 Display AI summaries (review, impact) in collapsible sections
  - [ ] 8.9 Show issue hierarchy: link to parent issue, list child issues/subtasks
  - [ ] 8.10 Implement inline editing for title, description, and all fields

---

### Phase 4: Polish (Weeks 7-8)

- [ ] 9.0 Implement Contextual UI Morphing
  - [ ] 9.1 Create `src/context/ViewModeContext.tsx` with `viewMode` state (zen/warroom)
  - [ ] 9.2 Add logic to detect user role on login and set default view mode
  - [ ] 9.3 Create `src/components/ViewModeToggle.tsx` with animated toggle button
  - [ ] 9.4 Add toggle to app header between user avatar and settings
  - [ ] 9.5 Implement Framer Motion page transition when switching modes
  - [ ] 9.6 Persist user's view preference in localStorage
  - [ ] 9.7 Apply Glassmorphism effects: blur background elements not in focus
  - [ ] 9.8 Dim sidebar in ZenMode to reduce distractions
  - [ ] 9.9 Update index route to render ZenMode or WarRoom based on view mode context

- [ ] 10.0 Testing & Final Polish
  - [ ] 10.1 Test Clerk authentication flow: sign-up, sign-in, sign-out
  - [ ] 10.2 Test onboarding flow: role selection persists correctly
  - [ ] 10.3 Test real-time updates: create issue in one tab, see it appear in another
  - [ ] 10.4 Test AI auto-assignment: create unassigned task, verify it gets assigned
  - [ ] 10.5 Test AI post-functions: move task to "in_review", verify summary is generated
  - [ ] 10.6 Test AQL queries: try various natural language queries
  - [ ] 10.7 Test issue comments: add, view, delete comments
  - [ ] 10.8 Test view mode toggle: switch between ZenMode and WarRoom
  - [ ] 10.9 Verify all loading states and error handling
  - [ ] 10.10 Run TypeScript type-check: `pnpm typecheck`
  - [ ] 10.11 Run linter and fix any warnings: `pnpm lint`
  - [ ] 10.12 Test responsive design on mobile viewport
  - [ ] 10.13 Review and update SEO meta tags
  - [ ] 10.14 Create PR and merge to main branch

---

## Summary

| Phase | Tasks | Sub-tasks | Estimated Duration |
| ------- | ------- | ----------- | ------------------- |
| Phase 1 | 3 main tasks | 31 sub-tasks | Weeks 1-2 |
| Phase 2 | 3 main tasks | 27 sub-tasks | Weeks 3-4 |
| Phase 3 | 2 main tasks | 21 sub-tasks | Weeks 5-6 |
| Phase 4 | 2 main tasks | 23 sub-tasks | Weeks 7-8 |
| **Total** | **10 main tasks** | **102 sub-tasks** | **8 weeks** |

---

*Generated from: prd-taskora-completion.md*
*Created: 2026-01-10*
