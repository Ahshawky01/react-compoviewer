'use client'

import dynamic from 'next/dynamic'

const CompoViewerLazy = dynamic(
  () =>
    Promise.all([
      import('react-compoviewer/next').then((m) => m.CompoViewer),
      import('../../.compoviewer/registry').then((m) => m),
    ]).then(([CompoViewer, { registry, config }]) => {
      return {
        default: () => (
          <CompoViewer registry={registry} config={config} />
        ),
      }
    }),
  { ssr: false },
)

export function DevViewer() {
  if (process.env.NODE_ENV !== 'development') return null
  return <CompoViewerLazy />
}
