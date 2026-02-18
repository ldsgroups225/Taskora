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
    env: {
      GOOGLE_API_KEY: 'dummy_key',
    },
    server: {
      deps: {
        inline: ['convex-test', 'convex'],
      },
    },
  },
})
