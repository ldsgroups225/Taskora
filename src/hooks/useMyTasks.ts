import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCurrentUser } from './useCurrentUser'

export function useMyTasks() {
  const { isAuthenticated, isLoading: isLoadingUser } = useCurrentUser()
  const tasks = useQuery(
    api.issues.listMyIssues,
    isAuthenticated ? {} : 'skip',
  )

  return {
    tasks,
    isLoading: isLoadingUser || (isAuthenticated && tasks === undefined),
    isAuthenticated,
  }
}
