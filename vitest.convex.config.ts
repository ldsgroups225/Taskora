import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  test: {
    environment: 'node',
    include: ['convex/**/*.test.ts'],
    server: {
      deps: {
        inline: ['convex-test', 'convex'],
      },
    },
  },
})
