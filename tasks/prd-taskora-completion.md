# PRD: Taskora Completion - Full Agentic Project Orchestration

## 1. Introduction/Overview

**Taskora** is a modular, agentic-first project management platform designed for high-growth startups. The core infrastructure has been built, but several key features remain incomplete or use placeholder implementations. This PRD outlines the full scope of work needed to complete Taskora as a production-ready, fully autonomous AI orchestration platform.

### Problem Statement

Currently, Taskora has:

- Mock data in ZenMode and WarRoom components instead of real Convex data
- Placeholder AI triggers that only log to console
- Basic filtering instead of natural language AQL (Agentic Query Language)
- No user authentication despite Clerk fields in the schema
- No project/user management UI
- Incomplete autonomous agent workflows

### Goal

Complete Taskora's implementation to deliver a **zero-management-overhead** project management system where AI agents autonomously handle task lifecycle management—from creation and intelligent assignment to status updates, re-prioritization, and stakeholder notifications.

---

## 2. Goals

1. **Full Data Integration**: Connect all UI components (ZenMode, WarRoom, TaskDetail) to real Convex data with real-time subscriptions.
2. **Complete Authentication**: Implement Clerk authentication with role-based access (Developer vs Manager).
3. **Advanced Agentic AI**: Deploy fully autonomous AI agents that re-prioritize backlogs, auto-assign tasks, generate documentation, and notify stakeholders—with minimal human intervention.
4. **Natural Language Queries (AQL)**: Enable users to query issues using natural language like *"show me critical bugs blocking the release"*.
5. **User & Project Management**: Provide full CRUD operations for users and projects with proper UI.
6. **Production-Ready State Machine**: Implement complete workflow transitions with AI-powered post-functions.

---

## 3. User Stories

### Authentication & Roles

1. **As a new user**, I want to sign up and sign in with Clerk (Google, GitHub, or email) so I can access Taskora securely.
2. **As a developer**, I want the system to recognize my role and show me the ZenMode interface by default.
3. **As a manager**, I want the system to recognize my role and show me the WarRoom dashboard by default.

### Issue Management

1. **As a developer**, I want to see my actual assigned tasks in ZenMode, not mock data.
2. **As a manager**, I want to see real project metrics, velocity scores, and risk indicators in the WarRoom.
3. **As a user**, I want to create, update, and delete issues through the UI with real-time sync.

### AI Orchestration

1. **As a product manager**, I want the AI to automatically re-balance the sprint when a critical bug is added, moving lower-priority stories to the next cycle.
2. **As a CTO**, I want the AI to predict delivery dates based on team velocity and current workload.
3. **As a developer**, I want the AI to auto-generate a summary when I move a task to "In Review".
4. **As a stakeholder**, I want to receive an AI-generated notification when a feature I care about moves to "Done".

### Natural Language Search (AQL)

1. **As a user**, I want to type *"show me all high priority tasks assigned to me"* in the Command Menu and get relevant results.
2. **As a manager**, I want to query *"tasks not touched in 3 days"* and see stale items.

### Project & User Management

1. **As an admin**, I want to create and manage projects with their own keys and descriptions.
2. **As an admin**, I want to invite team members and assign them roles (dev/manager).

---

## 4. Functional Requirements

### 4.1 Authentication (Clerk Integration)

| ID | Requirement |
| ---- | ------------- |
| AUTH-1 | Integrate Clerk for authentication with Google, GitHub, and email providers |
| AUTH-2 | On first sign-in, create a user record in Convex `users` table with clerkId |
| AUTH-3 | Sync user profile (name, email, avatar) from Clerk to Convex |
| AUTH-4 | Implement role selection during onboarding (Developer or Manager) |
| AUTH-5 | Protect all routes requiring authentication using Clerk middleware |
| AUTH-6 | Map `identity.subject` to `users.clerkId` for creator/assignee resolution |

### 4.2 Real Data Integration

| ID | Requirement |
| ---- | ------------- |
| DATA-1 | Replace mock data in `ZenMode.tsx` with real Convex queries for user's assigned tasks |
| DATA-2 | Replace hardcoded data in `WarRoom.tsx` with real project metrics from Convex |
| DATA-3 | Implement velocity calculation based on completed story points per sprint |
| DATA-4 | Implement risk indicator calculation based on overdue/blocked tasks |
| DATA-5 | Add real-time subscriptions so UI updates immediately when data changes |
| DATA-6 | Display actual sprint progress in the bento grid dashboard |

### 4.3 AI Post-Functions (Workflow Triggers)

| ID | Requirement |
| ---- | ------------- |
| AI-POST-1 | When issue transitions to `in_review`: Call Gemini to generate a review summary and store in `properties.aiSummary` |
| AI-POST-2 | When issue transitions to `done`: Generate an impact summary and trigger notification to stakeholders |
| AI-POST-3 | Implement proper `ctx.scheduler.runAfter()` for async AI triggers instead of console.log |
| AI-POST-4 | Store AI-generated content in the issue's `properties` field for audit trail |
| AI-POST-5 | Add a visible indicator in UI when AI has added content to an issue |

### 4.4 Auto-Assignment Agent

| ID | Requirement |
| ---- | ------------- |
| AGENT-1 | Implement a scheduled cron job that runs every 24 hours for auto-assignment |
| AGENT-2 | The agent should consider: developer workload (assigned open tasks), priority match, and past performance on similar task types |
| AGENT-3 | Auto-assign unassigned `backlog` and `todo` tasks to available developers |
| AGENT-4 | Log all AI decisions with reasoning in a new `agentLogs` table for auditability |
| AGENT-5 | Allow users to override AI assignments manually |

### 4.5 Dynamic Re-Prioritization Agent

| ID | Requirement |
| ---- | ------------- |
| REPRI-1 | Implement a daily cron job that re-ranks all backlog items |
| REPRI-2 | Consider factors: criticality, age, blocking relationships, and proximity to release |
| REPRI-3 | Store AI reasoning in `properties.aiPriorityReason` |
| REPRI-4 | Automatically bump `critical` bugs to top of backlog when created |
| REPRI-5 | Provide a "Review AI Changes" panel in WarRoom showing recent AI actions |

### 4.6 Natural Language Queries (AQL)

| ID | Requirement |
| ---- | ------------- |
| AQL-1 | Parse natural language queries in the Command Menu using Gemini |
| AQL-2 | Convert queries like *"my tasks"* to `assigneeId: currentUser` filter |
| AQL-3 | Support time-based queries: *"not touched in 3 days"*, *"created this week"* |
| AQL-4 | Support priority/status queries: *"critical bugs"*, *"in review items"* |
| AQL-5 | Support relational queries: *"tasks blocking the release"* (requires blocking relationship) |
| AQL-6 | Display parsed filter interpretation to user before showing results |

### 4.7 User & Project Management

| ID | Requirement |
| ---- | ------------- |
| MGMT-1 | Create a `/settings/projects` route for project management |
| MGMT-2 | Implement `createProject`, `updateProject`, `deleteProject` mutations |
| MGMT-3 | Create a `/settings/team` route for team/user management |
| MGMT-4 | Implement user invitation flow (generate invite link or add by email) |
| MGMT-5 | Allow role changes for existing users (dev ↔ manager) |
| MGMT-6 | Create onboarding flow for selecting initial project after sign-up |

### 4.8 Issue Detail View Enhancements

| ID | Requirement |
| ---- | ------------- |
| DETAIL-1 | Display AI-generated summaries in issue detail view |
| DETAIL-2 | Show issue hierarchy (parent issues and children/subtasks) |
| DETAIL-3 | Add activity log showing all state transitions and AI actions |
| DETAIL-4 | Implement inline editing for all issue fields |
| DETAIL-5 | Add comments/discussion thread per issue |

### 4.9 Contextual UI Morphing

| ID | Requirement |
| ---- | ------------- |
| UI-1 | Detect user role from Convex `users` table on login |
| UI-2 | Default to ZenMode for developers, WarRoom for managers |
| UI-3 | Add a smooth toggle transition (using Framer Motion) in the header |
| UI-4 | Persist user's view preference in localStorage |
| UI-5 | Apply Glassmorphism effects that enhance focus in current mode |

---

## 5. Non-Goals (Out of Scope)

1. **Git Integration**: No direct GitHub/GitLab integration in this phase.
2. **Calendar Integration**: No Google Calendar or similar integrations.
3. **Native Mobile App**: Web-first approach with PWA; no native iOS/Android apps.
4. **Legacy Jira Migration**: No import from existing Jira instances.
5. **Video Conferencing**: No built-in video/audio communication.
6. **Time Tracking**: No timesheet or time logging functionality.
7. **Multi-Tenancy/Teams**: Single workspace per deployment for now.

---

## 6. Design Considerations

### Visual Design

- **Theme**: Premium dark mode with Glassmorphism effects
- **Typography**: Use Inter or Geist font family for high-density data readability
- **Color Palette**: Indigo/Purple gradients for primary actions, Emerald for success, Orange/Red for warnings/errors
- **Micro-interactions**: Framer Motion for all transitions, hover states, and mode switching

### Component Library

- Use existing Shadcn/ui components from `/src/components/ui/`
- Extend Bento Grid patterns for WarRoom dashboards
- Command Menu (`⌘K`) is the primary interface for AQL queries

### Accessibility

- All interactive elements must have proper ARIA labels
- Support keyboard navigation throughout
- Maintain WCAG 2.1 AA contrast ratios

---

## 7. Technical Considerations

### Architecture

- **Frontend**: TanStack Start (React Router), React 19
- **Backend**: Convex for database, mutations, queries, and scheduled actions
- **AI**: Google Gemini 2.5 Flash via `@google/genai` SDK
- **Auth**: Clerk integration with Convex

### Database Schema Updates Required

```typescript
// New table for AI audit logs
agentLogs: defineTable({
  type: v.union(v.literal('assignment'), v.literal('reprioritization'), v.literal('summary')),
  issueId: v.optional(v.id('issues')),
  action: v.string(),
  reasoning: v.string(),
  metadata: v.any(),
  timestamp: v.number(),
})

// New table for comments
comments: defineTable({
  issueId: v.id('issues'),
  authorId: v.id('users'),
  content: v.string(),
  createdAt: v.number(),
}).index('by_issue', ['issueId'])

// New table for sprints (optional)
sprints: defineTable({
  projectId: v.id('projects'),
  name: v.string(),
  startDate: v.number(),
  endDate: v.number(),
  isActive: v.boolean(),
}).index('by_project', ['projectId'])
```

### Environment Variables Required

- `CLERK_PUBLISHABLE_KEY` - Clerk frontend key
- `CLERK_SECRET_KEY` - Clerk backend key
- `GEMINI_API_KEY` - Google Gemini API key (already exists)

### Cron Jobs to Implement

- **Daily at 2:00 AM**: Run auto-assignment agent
- **Daily at 3:00 AM**: Run re-prioritization agent
- **Every 15 minutes**: Check for stale issues and update risk indicators

---

## 8. Success Metrics

| Metric | Target | Measurement |
| -------- | -------- | ------------- |
| **AI Auto-Assignment Accuracy** | 85%+ tasks accepted without override | Track overrides vs acceptances |
| **Time to First Assignment** | < 5 minutes for new tasks | Measure creation → assignment time |
| **AQL Query Success Rate** | 90%+ queries return relevant results | User feedback + result relevance scoring |
| **User Role Detection Accuracy** | 100% correct default view | No incorrect initial view loads |
| **Real-time Sync Latency** | < 500ms | Measure mutation → UI update time |
| **AI Summary Quality** | 4+ star rating | In-app feedback widget |
| **Sprint Prediction Accuracy** | Within 15% of actual | Compare predicted vs actual dates |

---

## 9. Open Questions

1. **AI Confidence Thresholds**: What confidence level should trigger auto-actions vs requiring human approval? (Suggested: 90% for assignments, 95% for priority changes)

2. **Notification Channels**: Beyond in-app notifications, should we support email/Slack for "Done" notifications to stakeholders?

3. **Issue Blocking Relationships**: Do we need a separate `blockedBy` field in issues, or should we use the `properties` bag?

4. **Sprint Management**: Is full sprint/iteration support needed, or is a simple backlog → in-progress → done flow sufficient for MVP?

5. **Team Capacity Calculation**: Without calendar integration, how should we calculate team capacity? (Options: fixed story points per dev, or derived from historical velocity)

6. **Rollback Mechanism**: Should there be a way to "undo" AI re-prioritizations if the team disagrees?

---

## 10. Implementation Phases (Suggested)

### Phase 1: Foundation (Weeks 1-2)

- Clerk authentication integration
- Real data connection for ZenMode and WarRoom
- Basic user/project CRUD

### Phase 2: AI Core (Weeks 3-4)

- AI Post-Functions for status transitions
- Auto-assignment agent with cron
- Agent logs for auditability

### Phase 3: Intelligence (Weeks 5-6)

- Natural language AQL queries
- Dynamic re-prioritization agent
- AI-generated summaries display

### Phase 4: Polish (Weeks 7-8)

- Issue comments and activity log
- Contextual UI mode switching
- Risk indicators and velocity charts
- Final UI polish and micro-interactions

---

*Document Version: 1.0*
*Created: 2026-01-10*
*Author: AI Assistant following create-prd.md workflow*
