import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { WarRoom } from '~/components/WarRoom'
import { ZenMode } from '~/components/ZenMode'
import { RoleContext } from '~/context/RoleContext'

export const Route = createFileRoute('/')({
  component: Home,
})

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
