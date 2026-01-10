# Taskora Core Implementation

## Relevant Files

- `convex/schema.ts` - Database schema definitions for Issues, Projects, and Users.
- `convex/issues.ts` - Server-side functions for Issue CRUD and state transitions.
- `convex/agents.ts` - AI agent logic for auto-assignment and backlog grooming.
- `src/lib/gemini.ts` - Integration logic for `@google/genai` (Gemini 2.5 Flash).
- `app/routes/__root.tsx` - Layout and theme provider (Dark/Light mode).
- `app/routes/index.tsx` - Landing/Dashboard switcher depending on role.
- `app/routes/tasks/$taskId.tsx` - Contextual issue detail view.
- `src/components/ui/` - Shadcn components (Bento grid, Command menu, etc).
- `src/components/zen-mode/` - Developer-focused minimal interface components.
- `src/components/war-room/` - Manager-focused high-density dashboard components.

### Notes

- This project uses **TanStack Start** for the framework and **Convex** for the backend/database.
- AI features must use **Gemini 2.5 Flash** via the `@google/genai` SDK.
- The UI should leverage **Shadcn/ui 2026** blocks and patterns.
- Follow the **Contextual UI** requirement: ensure the interface can "morph" between Developer and Manager views.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch: `git checkout -b feature/taskora-core-implementation`

- [x] 1.0 Setup Database Schema (Convex)
  - [x] 1.1 Define `issues` table with fields for title, description, status, priority, type (Epic, Story, etc.), and parentId.
  - [x] 1.2 Implement `properties` JSONB-equivalent field using Convex's object type for "Entity Properties".
  - [x] 1.3 Create `projects` and `users` tables with basic metadata and role definitions (Dev/Manager).
  - [x] 1.4 Set up indexes for efficient querying by status and assignee.

- [x] 2.0 Implement Core Issue Management (Logic & CRUD)
  - [x] 2.1 Create Convex mutations for `createIssue`, `updateIssue`, and `deleteIssue`.
  - [x] 2.2 Implement the Workflow State Machine logic (transitions, validation rules).
  - [x] 2.3 Develop "AI Post-Functions" triggers in Convex (e.g., call Gemini when an issue moves to "In Review").
  - [x] 2.4 Build the "Agentic Query Language" (AQL) parser/handler for natural language filtering.

- [x] 3.0 Build the Agentic Engine (AI Orchestration with Gemini)
  - [x] 3.1 Initialize `@google/genai` with the Gemini 2.5 Flash model.
  - [x] 3.2 Create a prompt system for "Backlog Grooming" that re-ranks tasks based on metadata.
  - [x] 3.3 Implement the "Auto-Assignment" agent that reads team capacity and assigns work.
  - [x] 3.4 Build a status update agent that summarizes Git activity (simulated or integrated) to suggest status changes.

- [x] 4.0 Develop the Contextual UI (TanStack Start & Shadcn)
  - [x] 4.1 Set up TanStack Start routing for Dashboard and Issue Detail views.
  - [x] 4.2 Implement the "Zen Mode" components for developers (task-focused, minimal noise).
  - [x] 4.3 Implement the "War Room" bento-grid dashboard for managers.
  - [x] 4.4 Create the "Contextual Morphing" transition using Framer Motion to switch roles.
  - [x] 4.5 Add the Shadcn Command Menu (`⌘K`) for global AQL search and orchestration.

- [x] 5.0 Testing & Refinement
  - [x] 5.1 Perform end-to-end testing of the Issue Hierarchy (Initiative -> Subtask).
  - [x] 5.2 Validate AI auto-assignment logic with mock team data.
  - [x] 5.3 Ensure Dark/Light mode consistency across both Zen and War Room views.
  - [x] 5.4 Finalize SEO tags and semantic HTML structure for Taskora.
