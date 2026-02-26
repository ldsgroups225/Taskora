import type { Doc, Id } from '../../convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useCurrentUser } from './useCurrentUser'

export interface UseDeliverablesReturn {
  deliverables: Doc<'issues'>[] | undefined
  isLoading: boolean
  isAuthenticated: boolean
}

export function useDeliverables(projectId?: Id<'projects'>): UseDeliverablesReturn {
  const { isAuthenticated, isLoading: isLoadingUser } = useCurrentUser()
  const deliverables = useQuery(
    api.deliverables.getDeliverables,
    isAuthenticated && projectId ? { projectId } : 'skip',
  )

  return {
    deliverables: deliverables as Doc<'issues'>[] | undefined,
    isLoading: isLoadingUser || (isAuthenticated && deliverables === undefined),
    isAuthenticated,
  }
}
