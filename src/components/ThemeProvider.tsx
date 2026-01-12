import type { ThemeProviderProps } from 'next-themes'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * ThemeProvider component that wraps the application with theme support.
 * Supports 'light', 'dark', and 'system' themes with localStorage persistence.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
