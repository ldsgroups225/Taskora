import { onlineManager } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

/**
 * Subscribes to React Query's online status and shows a toast when connectivity changes, cleaning up the subscription on unmount.
 *
 * When the client goes offline, displays a persistent "offline" error toast with id "ReactQuery"; when it comes back online, displays a success "online" toast (short duration).
 */
export function useOfflineIndicator() {
  useEffect(() => {
    return onlineManager.subscribe(() => {
      if (onlineManager.isOnline()) {
        toast.success('online', {
          id: 'ReactQuery',
          duration: 2000,
        })
      }
      else {
        toast.error('offline', {
          id: 'ReactQuery',
          duration: Infinity,
        })
      }
    })
  }, [])
}