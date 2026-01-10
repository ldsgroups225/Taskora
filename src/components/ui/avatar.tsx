import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * Renders the Avatar root element with default avatar styles and optional additional classes.
 *
 * @param className - Additional CSS classes merged with the component's default avatar styles
 * @returns The Avatar root element (`AvatarPrimitive.Root`) with `data-slot="avatar"` and the composed `className`
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Renders a Radix Avatar image element with default sizing classes and a data-slot for styling hooks.
 *
 * @param className - Additional CSS classes to append to the default "aspect-square size-full"
 * @param props - Remaining props are forwarded to the underlying AvatarPrimitive.Image
 * @returns The AvatarPrimitive.Image element with `data-slot="avatar-image"` and a composed `className`
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  )
}

/**
 * Renders the avatar fallback used when the image is unavailable.
 *
 * @returns The AvatarPrimitive.Fallback element with default fallback styles and any forwarded props.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage }