import type { ReactNode } from 'react'

export default function CompoViewerWrapper({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: 16, fontFamily: 'system-ui' }}>
      {children}
    </div>
  )
}
