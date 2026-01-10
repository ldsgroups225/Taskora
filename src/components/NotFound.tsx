import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { FileQuestion } from 'lucide-react'

export function NotFound({ children }: { children?: any }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
        <FileQuestion className="w-10 h-10 text-indigo-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">404 - Not Found</h1>
        <div className="text-slate-400 max-w-md">
          {children || <p>The page you are looking for does not exist or has been moved by an AI agent.</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="border-white/10 hover:bg-white/5"
        >
          Go back
        </Button>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link to="/">
            Start Over
          </Link>
        </Button>
      </div>
    </div>
  )
}
