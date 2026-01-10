import * as React from 'react'

export type UserRole = 'dev' | 'manager'

export const RoleContext = React.createContext<{
  role: UserRole
  setRole: (role: UserRole) => void
}>({
  role: 'dev',
  setRole: () => { },
})
