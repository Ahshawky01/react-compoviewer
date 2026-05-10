'use client'

import type { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
}

export default function Card({ title, children }: CardProps) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        background: '#fafafa',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
