import { Suspense } from 'react'
import { ErrorBoundary } from './ErrorBoundary.js'
import type React from 'react'

interface PreviewProps {
  Component: React.ComponentType<Record<string, unknown>> | null
  componentName: string | null
  filePath: string | null
  props: Record<string, unknown>
  Wrapper: React.ComponentType<{ children: React.ReactNode }> | null
  loading: boolean
  loadError: string | null
}

export function Preview({
  Component,
  componentName,
  filePath,
  props,
  Wrapper,
  loading,
  loadError,
}: PreviewProps) {
  if (!componentName) {
    return (
      <div className="cv-preview-empty">
        <div className="cv-preview-empty-icon">&#9672;</div>
        <div className="cv-preview-empty-text">
          Select a component to preview
        </div>
        <div className="cv-preview-empty-hint">
          Search or browse the list on the left
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="cv-preview-loading">
        <div className="cv-spinner" />
        <span>Loading {componentName}...</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="cv-error-panel">
        <div className="cv-error-title">Failed to load</div>
        <pre className="cv-error-message">{loadError}</pre>
      </div>
    )
  }

  if (!Component) return null

  const filteredProps: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(props)) {
    if (val !== undefined && val !== '') {
      filteredProps[key] = val
    }
  }

  const preview = (
    <ErrorBoundary key={componentName + JSON.stringify(filteredProps)}>
      <Component {...filteredProps} />
    </ErrorBoundary>
  )

  return (
    <div className="cv-preview">
      <div className="cv-preview-header">
        <span className="cv-preview-name">{componentName}</span>
        {filePath && <span className="cv-preview-path">{filePath}</span>}
      </div>
      <div className="cv-preview-area">
        <Suspense fallback={<div className="cv-spinner" />}>
          {Wrapper ? <Wrapper>{preview}</Wrapper> : preview}
        </Suspense>
      </div>
    </div>
  )
}
