import { SignIn } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <div className="flex grow items-center justify-center p-4 min-h-[500px]">
      <div className="w-full max-w-md bg-background/50 backdrop-blur-xl border border-border/10 rounded-3xl overflow-hidden shadow-2xl">
        <SignIn />
      </div>
    </div>
  )
}
