import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * Card container component for composing a stylized card layout.
 *
 * @param className - Additional CSS class names to merge with the component's base card styles
 * @returns A `div` element configured as the card container (includes `data-slot="card"` and merged classes)
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Header region of a Card that layouts title, description, and optional actions.
 *
 * @param className - Additional CSS classes to merge with the header's default classes
 * @param props - Additional attributes forwarded to the header container
 * @returns The card header container element
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Title area within a card layout that applies heading typography and spacing.
 *
 * @returns A div element used as the card's title slot (`data-slot="card-title"`).
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

/**
 * Renders the card's description area with muted, small text styling.
 *
 * @param className - Additional CSS classes to apply to the description container
 * @returns The card description `div` element
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/**
 * Renders the card's action area positioned at the end of the card grid for placement of buttons or controls.
 *
 * This component merges any provided `className` with its base layout classes and forwards all other props onto the rendered element.
 *
 * @param className - Additional class names to merge with the component's base layout classes.
 * @returns The rendered `div` element for card actions.
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Container for a card's main content area that applies horizontal padding and accepts additional classes.
 *
 * @param className - Additional CSS classes to merge with the component's default padding class
 * @returns The rendered `div` element used as the card content container
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

/**
 * Footer region of a Card that aligns items and applies horizontal padding plus top spacing.
 *
 * @param className - Additional CSS class names to merge into the footer container
 * @returns The rendered card footer element
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}