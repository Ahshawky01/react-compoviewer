# react-compoviewer

Instantly preview any React component from your codebase in a side panel — no Storybook setup required.

- Automatically scans your project for all exported React components
- Keyboard shortcut opens a searchable overlay drawer
- Live preview with auto-generated prop controls based on TypeScript types
- HMR support — file edits refresh the preview instantly
- Works with **Vite** and **Next.js**
- Supports default exports, named exports, and context provider wrappers

## Prerequisites

- **Node.js** 18+
- **React** 18+ with **TypeScript**
- **Vite** 5+ or **Next.js** 14+

---

## Getting Started with Vite

### Step 1: Install

```bash
npm install -D react-compoviewer
```

### Step 2: Add the plugin to your Vite config

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compoviewer } from 'react-compoviewer/vite'

export default defineConfig({
  plugins: [react(), compoviewer()],
})
```

### Step 3: Start your dev server

```bash
npm run dev
```

### Step 4: Open the viewer

Press **Ctrl+Shift+V** (or **Cmd+Shift+V** on Mac) to open the component viewer panel.

That's it. The plugin automatically scans your project for React components, and the overlay will list them all with search, live preview, and prop controls.

---

## Getting Started with Next.js

### Step 1: Install

```bash
npm install -D react-compoviewer concurrently
```

### Step 2: Generate the component registry

Run the scanner to create a `.compoviewer/registry.ts` file:

```bash
npx compoviewer
```

This scans your project and generates a registry file that maps all your components.

### Step 3: Add `.compoviewer/` to your `.gitignore`

```bash
echo '.compoviewer/' >> .gitignore
```

The registry file is auto-generated and should not be committed.

### Step 4: Create a client component for the viewer

Since the viewer uses browser APIs, it must be a client component. Create a small wrapper:

```tsx
// src/app/dev-viewer.tsx
'use client'

import dynamic from 'next/dynamic'

const CompoViewerLazy = dynamic(
  () =>
    Promise.all([
      import('react-compoviewer/next').then((m) => m.CompoViewer),
      import('../../.compoviewer/registry').then((m) => m),
    ]).then(([CompoViewer, { registry, config }]) => {
      return {
        default: () => <CompoViewer registry={registry} config={config} />,
      }
    }),
  { ssr: false },
)

export function DevViewer() {
  if (process.env.NODE_ENV !== 'development') return null
  return <CompoViewerLazy />
}
```

### Step 5: Add the viewer to your root layout

```tsx
// src/app/layout.tsx
import type { ReactNode } from 'react'
import { DevViewer } from './dev-viewer'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <DevViewer />
      </body>
    </html>
  )
}
```

> Note: The `<DevViewer />` component renders nothing in production — it only activates in development mode.

### Step 6: Update your dev script

Run the Next.js dev server and the CompoViewer watcher together:

```json
{
  "scripts": {
    "dev": "concurrently \"next dev\" \"compoviewer --watch\""
  }
}
```

### Step 7: Start and open

```bash
npm run dev
```

Press **Ctrl+Shift+V** (or **Cmd+Shift+V** on Mac) to open the viewer.

### Step 8: Include the generated registry in your tsconfig

Add `.compoviewer/` to your `tsconfig.json` `include` array so TypeScript can resolve the imports:

```json
{
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".compoviewer/**/*.ts"]
}
```

---

## What You'll See

When you press the keyboard shortcut, a dark-themed drawer slides in from the right side of your app:

- **Search bar** at the top — type to fuzzy-search components by name
- **Component list** — all discovered components with file paths and export type badges
- **Recent list** — your last 10 viewed components (persisted across reloads)
- **Live preview** — the selected component rendered with current prop values
- **Props editor** — auto-generated controls for each prop based on its TypeScript type

---

## Configuration

Configuration is optional. If you want to customize behavior, create `compoviewer.config.ts` in your project root:

```ts
import { defineConfig } from 'react-compoviewer'

export default defineConfig({
  // Glob patterns for files to scan (default shown)
  include: ['src/**/*.tsx', 'src/**/*.jsx', 'app/**/*.tsx', 'app/**/*.jsx'],

  // Files to skip
  exclude: ['**/*.test.*', '**/*.spec.*', '**/*.stories.*', '**/*.d.ts'],

  // Wrap all previewed components with context providers
  wrapper: './src/compoviewer-wrapper.tsx',

  // Keyboard shortcut to toggle the viewer
  shortcut: 'ctrl+shift+v',

  // Panel appearance
  panel: {
    position: 'right',    // 'right' | 'left'
    defaultWidth: 420,    // pixels
    minWidth: 320,
    maxWidth: 800,
  },
})
```

### Wrapper Component (Context Providers)

Most React apps use context providers (theme, auth, language, router, etc.). If you preview a component that depends on a provider, CompoViewer will automatically detect the missing provider and show you the exact fix:

```
┌─────────────────────────────────────────────────┐
│  Missing Provider                               │
│                                                 │
│  This component needs LanguageProvider to render │
│                                                 │
│  Fix: create a wrapper file and add it to your  │
│  config:                                        │
│                                                 │
│  // compoviewer-wrapper.tsx                     │
│  import { LanguageProvider } from '...'         │
│  export default function Wrapper({ children }) {│
│    return <LanguageProvider>{children}</...>     │
│  }                                              │
│                                                 │
│  [Retry]  Click code blocks to copy             │
└─────────────────────────────────────────────────┘
```

To fix this, create a wrapper file with all the providers your components need:

#### Step 1: Create the wrapper

```tsx
// src/compoviewer-wrapper.tsx
import { ThemeProvider } from './shared/contexts/ThemeContext'
import { LanguageProvider } from './shared/contexts/LanguageContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

#### Step 2: Reference it in your config

```ts
// compoviewer.config.ts
import { defineConfig } from 'react-compoviewer'

export default defineConfig({
  wrapper: './src/compoviewer-wrapper.tsx',
})
```

#### Step 3: Restart your dev server

The wrapper applies to all previewed components. You only need to set this up once — after that, every component that needs those providers will work automatically.

> **Tip:** If you see a "Missing Provider" error for a new provider later, just add it to your existing wrapper file. No config change needed.

---

## Prop Controls

CompoViewer reads your TypeScript prop types and auto-generates the appropriate editing control:

| TypeScript Type | Generated Control | Example |
|----------------|-------------------|---------|
| `string` | Text input | `title: string` |
| `number` | Number input with stepper | `count: number` |
| `boolean` | Toggle switch | `disabled: boolean` |
| `'a' \| 'b' \| 'c'` | Dropdown select | `variant: 'primary' \| 'secondary'` |
| `ReactNode` | Text input (renders as text) | `children: ReactNode` |
| `() => void` | "Trigger" button (logs to console) | `onClick: () => void` |
| Objects / arrays / complex | JSON textarea | `style: CSSProperties` |

Props marked as `required` show a red `*` indicator. Default values are pre-filled in the controls.

---

## CLI Reference

The CLI is used for Next.js projects (Vite projects don't need it — the plugin handles everything).

```bash
# Scan once and generate .compoviewer/registry.ts
npx compoviewer

# Watch mode — regenerates on file changes
npx compoviewer --watch

# Custom root directory (e.g., for monorepos)
npx compoviewer --root=./packages/ui --watch
```

---

## How It Works

1. **Scanner** uses `fast-glob` to find `.tsx` / `.jsx` files matching your include/exclude patterns
2. **Parser** uses regex-based export detection to find named and default exports (PascalCase only — hooks and utilities are skipped), then `react-docgen-typescript` to extract prop types from TypeScript
3. **Vite plugin** serves the component registry as a virtual module and injects the overlay script into your HTML
4. **Client overlay** mounts a React app into a scoped `<div data-compoviewer>` with isolated CSS
5. **HMR** — when you save a file, the Vite plugin re-scans and sends a WebSocket event; the overlay updates without page reload

For Next.js, steps 3-4 are handled by the CLI (generates a registry file) and the `<CompoViewer />` component (mounts the overlay).

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+Shift+V** (Win/Linux) or **Cmd+Shift+V** (Mac) | Toggle the viewer panel |
| **Escape** | Close the viewer |
| **Arrow Up/Down** | Navigate the component list |
| **Enter** | Select the focused component |

The toggle shortcut is configurable via `compoviewer.config.ts`.

---

## FAQ

**Q: Does this affect my production bundle?**
No. The Vite plugin only runs in dev mode. The Next.js `<DevViewer />` component returns `null` in production. Nothing is included in your production build.

**Q: What components does it find?**
Any PascalCase-named `export function`, `export const`, or `export default function` in files matching your `include` patterns. Hooks (`use*`), utilities, and non-PascalCase exports are skipped.

**Q: A component shows "Missing Provider" — what do I do?**
CompoViewer auto-detects this and shows the exact provider name plus copy-pasteable fix code. Create a wrapper file with the required providers and add `wrapper: './src/compoviewer-wrapper.tsx'` to your config. See the [Wrapper Component](#wrapper-component-context-providers) section for a full example.

**Q: What if a component crashes in the preview?**
An error boundary catches render errors and shows the error message with a "Retry" button. Your app is unaffected.

**Q: My dev server is slow to start with CompoViewer — why?**
By default, prop parsing is lazy — it only runs when you click a component, not at startup. If startup is still slow, narrow your `include` patterns to specific directories (e.g., `['src/components/**/*.tsx']` instead of `['src/**/*.tsx']`).

**Q: Can I resize the panel?**
Yes — drag the left edge of the panel to resize it. The width is constrained by `minWidth` and `maxWidth` in your config.

**Q: Does it work with CSS Modules / Tailwind / styled-components?**
Yes. The previewed component runs in the same React tree as your app, so all styles apply normally. The viewer's own UI uses scoped CSS that won't conflict with your styles.

## License

MIT
