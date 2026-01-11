import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useCurrentUser() {
  const { isAuthenticated: isConvexAuthenticated, isLoading: isLoadingAuth } = useConvexAuth()
  const user = useQuery(api.auth.currentUser, isConvexAuthenticated ? {} : 'skip')

  return {
    user,
    isLoading: isLoadingAuth || (isConvexAuthenticated && user === undefined),
    isAuthenticated: isConvexAuthenticated && !!user,
    isConvexAuthenticated,
  }
}
