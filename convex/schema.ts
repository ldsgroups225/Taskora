import type { Infer } from 'convex/values'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const schema = defineSchema({
  // Legacy tables to maintain compatibility while migrating to Taskora
  boards: defineTable({
    id: v.string(),
    name: v.string(),
    color: v.string(),
  }).index('id', ['id']),

  columns: defineTable({
    id: v.string(),
    boardId: v.string(),
    name: v.string(),
    order: v.number(),
  })
    .index('id', ['id'])
    .index('board', ['boardId']),

  items: defineTable({
    id: v.string(),
    title: v.string(),
    content: v.optional(v.string()),
    order: v.number(),
    columnId: v.string(),
    boardId: v.string(),
  })
    .index('id', ['id'])
    .index('column', ['columnId'])
    .index('board', ['boardId']),

  // Taskora tables
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal('dev'), v.literal('manager')),
    avatarUrl: v.optional(v.string()),
  }).index('by_clerkId', ['clerkId']),

  projects: defineTable({
    name: v.string(),
    key: v.string(),
    description: v.optional(v.string()),
    leadId: v.id('users'),
  }).index('by_key', ['key']),

  issues: defineTable({
    projectId: v.id('projects'),
    parentId: v.optional(v.id('issues')),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal('backlog'),
      v.literal('todo'),
      v.literal('in_progress'),
      v.literal('in_review'),
      v.literal('done'),
    ),
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical'),
    ),
    type: v.union(
      v.literal('initiative'),
      v.literal('epic'),
      v.literal('story'),
      v.literal('task'),
      v.literal('bug'),
      v.literal('subtask'),
    ),
    assigneeId: v.optional(v.id('users')),
    creatorId: v.id('users'),
    order: v.number(),
    storyPoints: v.optional(v.number()),
    properties: v.any(), // Flexible "Entity Properties"
  })
    .index('by_project', ['projectId'])
    .index('by_assignee', ['assigneeId'])
    .index('by_status', ['status'])
    .index('by_parent', ['parentId']),

  agentLogs: defineTable({
    projectId: v.id('projects'),
    issueId: v.optional(v.id('issues')),
    action: v.string(),
    result: v.string(),
    status: v.union(v.literal('pending'), v.literal('success'), v.literal('failed')),
    error: v.optional(v.string()),
  })
    .index('by_project', ['projectId'])
    .index('by_issue', ['issueId']),

  comments: defineTable({
    issueId: v.id('issues'),
    authorId: v.id('users'),
    content: v.string(),
  }).index('by_issue', ['issueId']),

  activityLog: defineTable({
    issueId: v.id('issues'),
    userId: v.id('users'),
    action: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
  }).index('by_issue', ['issueId']),
})

export default schema

const board = schema.tables.boards.validator
const column = schema.tables.columns.validator
const item = schema.tables.items.validator

export const updateBoardSchema = v.object({
  id: board.fields.id,
  name: v.optional(board.fields.name),
  color: v.optional(v.string()),
})

export const updateColumnSchema = v.object({
  id: column.fields.id,
  boardId: column.fields.boardId,
  name: v.optional(column.fields.name),
  order: v.optional(column.fields.order),
})

export const deleteItemSchema = v.object({
  id: item.fields.id,
  boardId: item.fields.boardId,
})
const { order, id, ...rest } = column.fields
export const newColumnsSchema = v.object(rest)
export const deleteColumnSchema = v.object({
  boardId: column.fields.boardId,
  id: column.fields.id,
})

export type Board = Infer<typeof board>
export type Column = Infer<typeof column>
export type Item = Infer<typeof item>
export type User = Infer<typeof schema.tables.users.validator>
export type Project = Infer<typeof schema.tables.projects.validator>
export type Issue = Infer<typeof schema.tables.issues.validator>
export type DocIssue = Issue & { _id: string, _creationTime: number }
