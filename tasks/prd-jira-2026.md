# PRD: Jira 2026 - Agentic Project Orchestration

## 1. Introduction/Overview

**Jira 2026** is a modular, agentic-first project management platform designed for high-growth startups. Unlike traditional tools that act as passive databases, Jira 2026 features a **Fully Agentic AI Core** that autonomously manages backlogs, predicts bottlenecks, and re-prioritizes work based on real-time team velocity. It features a **Contextual UI** that transforms based on the user's role—focusing on code and tasks for developers, and high-level strategy and delivery for managers.

The clone name is "Taskora" that is current project (see git or file tree)

### Goal

To build a project management system that reduces "management overhead" to near-zero by allowing AI agents to handle the administrative lifecycle of a task—from creation and assignment to status updates and documentation.

---

## 2. Goals

1. **Zero-Config Hierarchy**: Implement a nested issue structure (Initiative > Epic > Story/Task/Bug > Subtask) that works out of the box.
2. **Autonomous Orchestration**: Deploy AI agents that can re-prioritize the backlog and assign tasks based on contributor availability and skill set.
3. **Dynamic Workflow Engine**: A state machine that supports custom transitions with AI-powered "Post-Functions" (e.g., auto-generating a PR description when a task moves to "In Review").
4. **Contextual UI Transformation**: Morph the interface between "Zen Mode" (dev-centric) and "War Room" (manager-centric) using Shadcn/ui 2026 patterns.

---

## 3. User Stories

1. **As a Developer**, I want a "Zen Mode" interface that shows only my current task, related code snippets, and active terminal logs, so I can stay in flow without notification clutter.
2. **As a Product Manager**, I want the AI to automatically re-balance the Sprint when an urgent hotfix is added, re-assigning lower-priority stories to the next cycle without manual dragging.
3. **As a CTO**, I want a "War Room" dashboard that uses bento-grid layouts to show predictive delivery dates and team velocity trends.
4. **As an AI Agent**, I need to be able to read issue metadata and update "Entity Properties" to store my internal reasoning for task priority changes.

---

## 4. Functional Requirements

### 4.1. Core Issue System

1. **Hierarchy**: Support for 4 levels: Initiatives, Epics, Tasks/Stories/Bugs, and Sub-tasks.
2. **Entity Properties**: Key-value metadata store per issue for extensibility without schema changes.
3. **Search (AQL - Agentic Query Language)**: An evolution of JQL that supports natural language queries like *"show me tasks that are blocking the Jan 15th release and haven't been touched in 3 days."*

### 4.2. Workflow Engine

1. **State Machine**: Configurable statuses (Backlog, To Do, In Progress, In Review, Done).
2. **AI Post-Functions**:
    * `onTransition(To Review)`: Auto-generate documentation or summary.
    * `onTransition(Done)`: Trigger a notification to stakeholders with a summary of the impact.

### 4.3. Fully Agentic Orchestration

1. **Auto-Assignment**: AI monitors team capacity (via Git activity and calendar) and assigns tasks.
2. **Dynamic Re-prioritization**: AI re-ranks the backlog every 24 hours based on "Success Metric" proximity and release dates.

### 4.4. UI/UX (Contextual)

1. **Role-Based Layouts**:
    * **Developer**: Dark/Light-mode focused, integrated code viewer, minimal navigation.
    * **Manager**: High-density bento grids, timeline views, and risk heatmaps.
2. **Shadcn/ui Components**: Use `@shadcn/ui` 2026 "Blocks" for Bento Grids, dynamic charts, and "Command Menu" orchestration.

---

## 5. Non-Goals (Out of Scope)

1. **Legacy Jira Migration**: We will not support importing data from Jira Server/On-prem versions in the MVP.
2. **Native Mobile App**: The MVP will be a responsive Web App using PWA standards.
3. **Video Conferencing**: No built-in video calls; focus strictly on task/issue orchestration.

---

## 6. Design Considerations

* **Aesthetics**: Premium Glassmorphism + "Contextual Morphing". Surfaces should blur and dim based on user focus.
* **Typography**: Use high-legibility sans-serif (e.g., *Inter* or *Geist*) to handle high data density.
* **Micro-interactions**: Use `framer-motion` for layout transitions between "Zen" and "War Room" modes.
* **Shadcn/ui 2026**: Leverage the new `Shadcn MCP` for dynamic component injection based on AI recommendations.

---

## 7. Technical Considerations

* **Frontend**: Tanstack start (current project check file tree), Tailwind CSS (for layout), Shadcn/ui (for components).
* **State Management**: React Server Components + TanStack Query for real-time sync.
* **AI Backend**: Integration with "@google/genai" (gemini-2.5-flash) for complex agentic loops (Backlog Grooming -> Task Breakdown -> Assignment).
* **Database**: Convex db for Entity Properties; Redis for real-time workflow state.

---

## 8. Success Metrics

1. **Management Overhead**: 50% reduction in time spent by PMs in "Backlog Refinement" sessions.
2. **Developer Flow**: Increase in average "Focus Hours" reported by team members.
3. **Predictive Accuracy**: Release date predictions should be within 10% variance of reality.

---

## 9. Open Questions

1. How do we handle "Human-in-the-loop" approval for AI re-prioritizations? (Checkbox or Silent Mode?).
2. Does the AI have permission to create new Git branches automatically?
3. Should the "Contextual UI" be toggled manually or based on system-detected activity?
