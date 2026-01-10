import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  ignores: [
    'convex/_generated/*',
    'src/routeTree.gen.ts',
    'convex/README.md',
    'dist',
    'node_modules',
  ],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'node/prefer-global/process': 'off',
    'react-refresh/only-export-components': 'warn',
    'eslint-comments/no-unlimited-disable': 'off',
    'unused-imports/no-unused-vars': 'warn',
    'ts/strict-boolean-expressions': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-return': 'off',
    'ts/no-unsafe-argument': 'off',
    'ts/no-misused-promises': 'off',
    'react-dom/no-flush-sync': 'off',
  },
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
}, {
  files: ['convex/**/*.ts'],
  rules: {
    'no-console': 'off',
    'unused-imports/no-unused-vars': 'off',
  },
})
