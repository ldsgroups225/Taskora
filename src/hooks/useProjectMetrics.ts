import type { Id } from '../../convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCurrentUser } from './useCurrentUser'

export function useProjectMetrics(projectId?: Id<'projects'>) {
  const { isAuthenticated, isLoading: isLoadingUser } = useCurrentUser()
  const metrics = useQuery(
    api.metrics.getProjectMetrics,
    isAuthenticated ? { projectId } : 'skip',
  )

  return {
    metrics,
    isLoading: isLoadingUser || (isAuthenticated && metrics === undefined),
    isAuthenticated,
  }
}
