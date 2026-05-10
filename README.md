# react-compoviewer

Instantly preview any React component from your codebase in a side panel — no Storybook setup required.

- Scans your project for all exported React components
- Keyboard shortcut opens a searchable overlay drawer
- Live preview with auto-generated prop controls
- HMR support — edits refresh the preview instantly
- Works with Vite and Next.js

## Quick Start

### Vite

```bash
npm install -D react-compoviewer
```

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compoviewer } from 'react-compoviewer/vite'

export default defineConfig({
  plugins: [react(), compoviewer()],
})
```

Start your dev server and press **Ctrl+Shift+V** to open the viewer.

### Next.js

```bash
npm install -D react-compoviewer
```

Generate the component registry:

```bash
npx compoviewer --watch
```

Add the viewer to your root layout:

```tsx
// src/app/layout.tsx
'use client'
import { CompoViewer } from 'react-compoviewer/next'
import { registry, config } from '../.compoviewer/registry'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <CompoViewer registry={registry} config={config} />
        )}
      </body>
    </html>
  )
}
```

Run both the Next.js dev server and the CompoViewer watcher:

```json
{
  "scripts": {
    "dev": "concurrently \"next dev\" \"compoviewer --watch\""
  }
}
```

## Configuration

Create `compoviewer.config.ts` in your project root:

```ts
import { defineConfig } from 'react-compoviewer'

export default defineConfig({
  // Glob patterns for component files
  include: ['src/**/*.tsx'],
  exclude: ['**/*.test.*', '**/*.stories.*'],

  // Wrap previewed components with context providers
  wrapper: './src/compoviewer-wrapper.tsx',

  // Keyboard shortcut to toggle the viewer
  shortcut: 'ctrl+shift+v',

  // Panel appearance
  panel: {
    position: 'right',    // 'right' | 'left'
    defaultWidth: 420,
    minWidth: 320,
    maxWidth: 800,
  },
})
```

### Wrapper Component

If your components need context providers (theme, auth, router, etc.), create a wrapper:

```tsx
// src/compoviewer-wrapper.tsx
import { ThemeProvider } from './theme'

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
```

## Prop Controls

CompoViewer auto-generates editing controls based on TypeScript prop types:

| TypeScript Type | Control |
|----------------|---------|
| `string` | Text input |
| `number` | Number input |
| `boolean` | Toggle switch |
| `'a' \| 'b' \| 'c'` | Dropdown select |
| `ReactNode` | Text input |
| `() => void` | Trigger button |
| Objects / complex | JSON textarea |

## CLI

```bash
# Scan once and generate registry
npx compoviewer

# Watch mode — regenerates on file changes
npx compoviewer --watch

# Custom root directory
npx compoviewer --root=./packages/ui --watch
```

## How It Works

1. **Scanner** uses `fast-glob` to find `.tsx`/`.jsx` files in your project
2. **Parser** uses `es-module-lexer` to detect exports and `react-docgen-typescript` to extract prop types
3. **Vite plugin** serves the registry as a virtual module and injects the overlay
4. **Client overlay** renders a searchable drawer with live component preview and prop controls
5. **HMR** re-scans on file changes and updates the preview without page reload

## License

MIT
