import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import * as React from 'react'

import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'

/**
 * Renders the top-level AlertDialog root element and forwards all received props to it.
 *
 * @param props - Props forwarded to the underlying AlertDialog root primitive
 * @returns A rendered AlertDialog root element with `data-slot="alert-dialog"` and the provided props
 */
function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

/**
 * Renders the alert dialog overlay with a centered backdrop and state-based enter/exit animations.
 *
 * @param className - Additional CSS classes to append to the overlay's class list
 * @returns The overlay element used by the alert dialog; all other props are forwarded to the underlying Radix Overlay primitive
 */
function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Renders the alert dialog content centered in a portal with an overlay and default styling.
 *
 * @param className - Additional CSS classes appended to the component's default classes
 * @returns The alert dialog content element rendered inside a portal with its overlay; all other props are forwarded to `AlertDialogPrimitive.Content`
 */
function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

/**
 * Renders the header section for an alert dialog.
 *
 * @param className - Additional CSS classes appended to the header container.
 * @param props - Additional HTML attributes forwarded to the container element.
 * @returns The header container element with slot and layout classes applied.
 */
function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

/**
 * Renders the alert dialog footer and arranges action controls responsively.
 *
 * @returns A div element with `data-slot="alert-dialog-footer"`, responsive layout classes (stacked on small screens, horizontal aligned on larger screens), the merged `className`, and any other forwarded props.
 */
function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Renders an alert dialog title element with preset typography and a `data-slot` attribute.
 *
 * @param className - Additional CSS classes to append to the component's default `text-lg font-semibold` styling
 * @returns The rendered AlertDialog title element with merged classes and `data-slot="alert-dialog-title"`
 */
function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

/**
 * Renders an alert dialog description element with default muted typography and a `data-slot` attribute.
 *
 * @param className - Additional CSS classes to merge with the default typography classes
 * @returns The rendered description element with merged classes and forwarded props
 */
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

/**
 * Renders an AlertDialog cancel button with outline button styling.
 *
 * @returns A configured `AlertDialogPrimitive.Cancel` element that applies the outline button variant classes merged with any provided `className`, forwarding all other props.
 */
function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}