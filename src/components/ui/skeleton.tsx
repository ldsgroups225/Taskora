import { cn } from '~/lib/utils'

/**
 * Renders a pulsing, rounded placeholder div used as a loading skeleton.
 *
 * @param className - Additional CSS classes to merge with the default skeleton styles
 * @returns A div element styled with a pulsing background and rounded corners
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }