import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { WarRoom } from '~/components/WarRoom'
import { ZenMode } from '~/components/ZenMode'
import { RoleContext } from '~/context/RoleContext'

export const Route = createFileRoute('/')({
  component: Home,
})

/**
 * Render the home view that displays either the developer ZenMode or the default WarRoom based on the current role.
 *
 * @returns The root JSX element for the home route. Shows `ZenMode` when `role` is `"dev"`, otherwise shows `WarRoom`, both wrapped for presence-based transitions.
 */
function Home() {
  const { role } = React.use(RoleContext)

  return (
    <div className="grow flex flex-col min-h-0 overflow-y-auto">
      <AnimatePresence mode="wait">
        {role === 'dev'
          ? (
              <ZenMode key="zen" />
            )
          : (
              <WarRoom key="war" />
            )}
      </AnimatePresence>
    </div>
  )
}