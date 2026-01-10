import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { AlertTriangle, RefreshCcw, Home as HomeIcon } from 'lucide-react'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  console.error(error)

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">System Error</h2>
        <div className="text-slate-400 max-w-md mx-auto">
          <ErrorComponent error={error} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => router.invalidate()}
          variant="secondary"
          className="gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </Button>

        {isRoot ? (
          <Button asChild variant="outline" className="gap-2 border-white/10">
            <Link to="/">
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="gap-2 border-white/10"
            onClick={(e) => {
              e.preventDefault()
              window.history.back()
            }}
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  )
}
