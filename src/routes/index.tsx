import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ZenMode } from '~/components/ZenMode'
import { WarRoom } from '~/components/WarRoom'
import { AnimatePresence } from 'framer-motion'
import { RoleContext } from './__root'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { role } = React.useContext(RoleContext)

  return (
    <div className="grow flex flex-col min-h-0 overflow-y-auto">
      <AnimatePresence mode="wait">
        {role === 'dev' ? (
          <ZenMode key="zen" />
        ) : (
          <WarRoom key="war" />
        )}
      </AnimatePresence>
    </div>
  )
}
