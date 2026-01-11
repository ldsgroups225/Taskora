import * as React from 'react'

export type UserRole = 'dev' | 'manager'

export const RoleContext = React.createContext<{
  role: UserRole
  setRole: (role: UserRole) => void
}>({
  role: 'dev',
  setRole: () => { },
})
export function useRole() {
  const context = React.use(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
