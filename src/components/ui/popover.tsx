'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * Wraps Radix's PopoverPrimitive.Root, forwarding all received props and adding a `data-slot="popover"` attribute.
 *
 * @param props - Props accepted by `PopoverPrimitive.Root`, forwarded to the underlying element.
 * @returns The rendered Popover root element with `data-slot="popover"` and the forwarded props.
 */
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

/**
 * Renders popover content inside a portal with sensible defaults and merged styling.
 *
 * @param className - Additional CSS classes to merge with the component's default styles
 * @param align - Alignment of the content relative to the trigger; defaults to 'center'
 * @param sideOffset - Distance in pixels between the trigger and the content; defaults to 4
 * @param props - Additional props forwarded to the underlying PopoverPrimitive.Content
 * @returns The popover content element rendered inside a portal with merged className and forwarded props
 */
function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

/**
 * Renders a Popover anchor element that forwards all received props and sets a `data-slot` attribute of "popover-anchor".
 *
 * @returns The rendered PopoverPrimitive.Anchor element with forwarded props and `data-slot="popover-anchor"`.
 */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }