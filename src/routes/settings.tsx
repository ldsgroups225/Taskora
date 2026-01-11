import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { FolderGit2, Sparkles, Users } from 'lucide-react'

export const Route = createFileRoute('/settings')({
  component: SettingsLayout,
})

function SettingsLayout() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <h2 className="text-xl font-bold text-foreground mb-4 px-4">Settings</h2>
          <nav className="flex flex-col space-y-1">
            <Link
              to="/settings/projects"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/5 transition-all [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <FolderGit2 className="w-4 h-4" />
              Projects
            </Link>
            <Link
              to="/settings/team"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/5 transition-all [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <Users className="w-4 h-4" />
              Team
            </Link>
            <Link
              to="/settings/ai"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/5 transition-all [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
            >
              <Sparkles className="w-4 h-4" />
              AI Grooming
            </Link>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
