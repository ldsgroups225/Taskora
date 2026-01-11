import { useMutation } from 'convex/react'
import { Mail, Shield, User } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { api } from '../../convex/_generated/api'

interface UserInviteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserInvite({ open, onOpenChange }: UserInviteProps) {
  const inviteUser = useMutation(api.users.inviteUser)
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<'dev' | 'manager'>('dev')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email)
      return

    setIsSubmitting(true)
    try {
      await inviteUser({ email, role })
      toast.success('Invitation sent (placeholder)')
      setEmail('')
      onOpenChange(false)
    }
    catch (err) {
      const error = err as Error
      toast.error(error.message || 'Failed to send invitation')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/10 text-foreground rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Invite Member
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Invite a new member to your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                className="bg-card/5 border-border/10 rounded-xl pl-10 focus:ring-primary"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Initial Role</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('dev')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  role === 'dev'
                    ? 'bg-primary/10 border-primary/50 text-foreground'
                    : 'bg-card/5 border-border/10 text-muted-foreground hover:bg-card/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'dev' ? 'bg-primary' : 'bg-secondary'}`}>
                  <User className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Developer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('manager')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  role === 'manager'
                    ? 'bg-primary/10 border-primary/50 text-foreground'
                    : 'bg-card/5 border-border/10 text-muted-foreground hover:bg-card/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === 'manager' ? 'bg-primary' : 'bg-secondary'}`}>
                  <Shield className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Manager</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary rounded-xl px-8"
            >
              Send Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
