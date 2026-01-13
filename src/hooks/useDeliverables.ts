import type { Id } from '../../convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCurrentUser } from './useCurrentUser'

export function useDeliverables(projectId?: Id<'projects'>) {
  const { isAuthenticated, isLoading: isLoadingUser } = useCurrentUser()
  const deliverables = useQuery(
    api.deliverables.getDeliverables,
    isAuthenticated && projectId ? { projectId } : 'skip',
  )

  return {
    deliverables,
    isLoading: isLoadingUser || (isAuthenticated && deliverables === undefined),
    isAuthenticated,
  }
}
