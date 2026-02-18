import type { ConvexReactClient } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import {
  MutationCache,
  notifyManager,
  QueryClient,
} from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { del, get, set } from 'idb-keyval'
import { toast } from 'sonner'
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary'
import { NotFound } from './components/NotFound'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  if (typeof document !== 'undefined') {
    notifyManager.setScheduler(window.requestAnimationFrame)
  }

  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL!
  if (!CONVEX_URL) {
    console.error('missing envar CONVEX_URL')
  }
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        toast(error.message, { className: 'bg-destructive text-foreground' })
      },
    }),
  })
  convexQueryClient.connect(queryClient)

  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    context: { queryClient, convexClient: convexQueryClient.convexClient },
    scrollRestoration: true,
  })
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  if (typeof window !== 'undefined') {
    const persister = createAsyncStoragePersister({
      storage: {
        getItem: get,
        setItem: set,
        removeItem: del,
      },
    })

    persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
  }

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
  interface FileRoutesContext {
    queryClient: QueryClient
    convexClient: ConvexReactClient
  }
}
