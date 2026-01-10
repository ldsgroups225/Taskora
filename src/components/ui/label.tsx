'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

import { cn } from '~/lib/utils'

/**
 * Styled wrapper around the Radix UI Label primitive that applies default layout and typography classes.
 *
 * @param className - Optional additional CSS classes to merge with the component's default styles.
 * @param props - All other props are forwarded to the underlying LabelPrimitive.Root element.
 * @returns The rendered LabelPrimitive.Root element with combined class names and forwarded props.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }