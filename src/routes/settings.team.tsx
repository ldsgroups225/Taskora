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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and their roles.</p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="bg-primary hover:bg-primary rounded-xl flex items-center gap-2"
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
                <Skeleton key={`skeleton-${i}`} className="h-20 w-full rounded-2xl bg-card/5" />
              ))
            )
          : (
              users.map(user => (
                <Card key={user._id} className="bg-card/5 border-border/10 rounded-2xl overflow-hidden hover:bg-card/8 transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-border/10">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {String(user.name || '').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{user.name}</h3>
                          {user.role === 'manager' && (
                            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-bold py-0 h-4">
                              <Shield className="w-2 h-2 mr-1" />
                              MANAGER
                            </Badge>
                          )}
                          {user.role === 'dev' && (
                            <Badge variant="outline" className="bg-muted/10 border-border/20 text-muted-foreground text-[10px] font-bold py-0 h-4">
                              <BadgeCheck className="w-2 h-2 mr-1" />
                              DEV
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-lg text-xs gap-2">
                            Manage Access
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border-border/10 text-foreground rounded-xl">
                          <DropdownMenuLabel className="text-muted-foreground text-xs">Change Role</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-card/5" />
                          <DropdownMenuItem
                            onClick={async () => handleRoleChange(user._id, 'manager')}
                            className="focus:bg-primary focus:text-foreground rounded-lg cursor-pointer"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => handleRoleChange(user._id, 'dev')}
                            className="focus:bg-primary focus:text-foreground rounded-lg cursor-pointer"
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
