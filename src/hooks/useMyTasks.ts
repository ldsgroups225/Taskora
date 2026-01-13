import type { Id } from '../../convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCurrentUser } from './useCurrentUser'

export function useMyTasks(projectId?: Id<'projects'>) {
  const { isAuthenticated, isLoading: isLoadingUser } = useCurrentUser()
  const tasks = useQuery(
    api.issues.listMyIssues,
    isAuthenticated && projectId ? { projectId } : 'skip',
  )

  return {
    tasks,
    isLoading: isLoadingUser || (isAuthenticated && tasks === undefined),
    isAuthenticated,
  }
}
