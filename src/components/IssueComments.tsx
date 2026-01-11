import type { Id } from '../../convex/_generated/dataModel'
import { useConvexMutation } from '@convex-dev/react-query'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { issueQueries } from '~/queries'
import { api } from '../../convex/_generated/api'

interface IssueCommentsProps {
  issueId: Id<'issues'>
}

interface EnrichedComment {
  _id: Id<'comments'>
  _creationTime: number
  issueId: Id<'issues'>
  authorId: Id<'users'>
  content: string
  authorName: string
  authorAvatar?: string
}

export function IssueComments({ issueId }: IssueCommentsProps) {
  const { data: comments } = useSuspenseQuery(issueQueries.comments(issueId)) as { data: EnrichedComment[] }
  const [content, setContent] = React.useState('')

  const addCommentMutation = useMutation({
    mutationFn: useConvexMutation(api.comments.addComment),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: useConvexMutation(api.comments.deleteComment),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim())
      return

    try {
      await addCommentMutation.mutateAsync({ issueId, content })
      setContent('')
    }
    catch (err) {
      console.error('Failed to add comment', err)
    }
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-2 border-b border-border/10 pb-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Comments</h3>
        <span className="ml-auto text-xs text-muted-foreground font-mono bg-card/5 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {comments.map(comment => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-4 p-4 rounded-2xl bg-card/5 border border-border/5 hover:bg-card/8 transition-colors group"
            >
              <Avatar className="w-8 h-8 ring-1 ring-white/10">
                <AvatarImage src={comment.authorAvatar} />
                <AvatarFallback className="bg-primary text-foreground text-[10px]">
                  {comment.authorName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{comment.authorName}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(comment._creationTime).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCommentMutation.mutate({ id: comment._id })}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive -mr-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="py-8 text-center text-muted-foreground italic text-sm">
            Be the first to comment on this issue.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative pt-4">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={e => setContent(e.target.value)}
          className="min-h-[100px] bg-card/5 border-border/10 rounded-2xl focus:ring-primary text-foreground resize-none pb-12"
        />
        <div className="absolute bottom-3 right-3">
          <Button
            type="submit"
            disabled={!content.trim() || addCommentMutation.isPending}
            className="bg-primary hover:bg-primary text-foreground rounded-xl px-4 py-2 h-9 border-0 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {addCommentMutation.isPending
              ? 'Sending...'
              : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-2" />
                    Comment
                  </>
                )}
          </Button>
        </div>
      </form>
    </div>
  )
}
