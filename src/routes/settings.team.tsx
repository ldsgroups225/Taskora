import type { Id } from '../../convex/_generated/dataModel'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { BadgeCheck, Mail, MoreVertical, Shield, UserPlus } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Skeleton } from '~/components/ui/skeleton'
import { UserInvite } from '~/components/UserInvite'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/settings/team')({
  component: TeamSettings,
})

function TeamSettings() {
  const users = useQuery(api.users.listUsers)
  const updateUserRole = useMutation(api.users.updateUserRole)
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)

  const handleRoleChange = async (userId: Id<'users'>, role: 'dev' | 'manager') => {
    try {
      await updateUserRole({ userId, role })
      toast.success(`Role updated to ${role}`)
    }
    catch {
      toast.error('Failed to update role')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Team Management</h1>
          <p className="text-slate-500">Manage your team members and their roles.</p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users === undefined
          ? (
              Array.from({ length: 3 }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Skeleton key={`skeleton-${i}`} className="h-20 w-full rounded-2xl bg-white/5" />
              ))
            )
          : (
              users.map(user => (
                <Card key={user._id} className="bg-white/5 border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-indigo-600/20 text-indigo-400">
                          {String(user.name || '').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{user.name}</h3>
                          {user.role === 'manager' && (
                            <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-[10px] font-bold py-0 h-4">
                              <Shield className="w-2 h-2 mr-1" />
                              MANAGER
                            </Badge>
                          )}
                          {user.role === 'dev' && (
                            <Badge variant="outline" className="bg-slate-500/10 border-slate-500/20 text-slate-400 text-[10px] font-bold py-0 h-4">
                              <BadgeCheck className="w-2 h-2 mr-1" />
                              DEV
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white rounded-lg text-xs gap-2">
                            Manage Access
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white rounded-xl">
                          <DropdownMenuLabel className="text-slate-400 text-xs">Change Role</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem
                            onClick={async () => handleRoleChange(user._id, 'manager')}
                            className="focus:bg-indigo-600 focus:text-white rounded-lg cursor-pointer"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => handleRoleChange(user._id, 'dev')}
                            className="focus:bg-indigo-600 focus:text-white rounded-lg cursor-pointer"
                          >
                            <BadgeCheck className="w-4 h-4 mr-2" />
                            Developer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
      </div>

      <UserInvite
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  )
}
