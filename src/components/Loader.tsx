import { Loader2 } from 'lucide-react'

export function Loader() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  )
}
