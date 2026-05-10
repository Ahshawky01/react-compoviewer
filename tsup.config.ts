import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      vite: 'src/vite.ts',
      next: 'src/next.ts',
      cli: 'src/node/cli.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: true,
    clean: true,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'vite', 'typescript'],
    outExtension: () => ({ js: '.mjs' }),
  },
  {
    entry: {
      'client/index': 'src/client/index.tsx',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    outExtension: () => ({ js: '.mjs' }),
    esbuildOptions(options) {
      options.jsx = 'automatic'
    },
  },
])
