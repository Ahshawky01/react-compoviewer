import type { ReactNode } from 'react'
import { DevViewer } from './dev-viewer'

export const metadata = {
  title: 'CompoViewer Next.js Example',
}

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
