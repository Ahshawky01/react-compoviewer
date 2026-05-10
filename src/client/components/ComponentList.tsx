import { useRef, useEffect, useCallback } from 'react'
import type { ComponentEntry } from '../../types.js'

interface ComponentListProps {
  components: Array<ComponentEntry & { load: () => Promise<unknown> }>
  selectedName: string | null
  onSelect: (component: ComponentEntry & { load: () => Promise<unknown> }) => void
  focusIndex: number
  onFocusChange: (index: number) => void
  recentNames: string[]
  showRecent: boolean
}

export function ComponentList({
  components,
  selectedName,
  onSelect,
  focusIndex,
  onFocusChange,
  recentNames,
  showRecent,
}: ComponentListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        onFocusChange(Math.min(focusIndex + 1, components.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        onFocusChange(Math.max(focusIndex - 1, 0))
      } else if (e.key === 'Enter' && components[focusIndex]) {
        e.preventDefault()
        onSelect(components[focusIndex])
      }
    },
    [focusIndex, components, onFocusChange, onSelect],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const el = listRef.current?.children[focusIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusIndex])

  const recentComponents = showRecent
    ? components.filter((c) => recentNames.includes(c.name))
    : []

  return (
    <div className="cv-component-list" ref={listRef}>
      {showRecent && recentComponents.length > 0 && (
        <>
          <div className="cv-list-section-header">Recent</div>
          {recentComponents.map((comp) => (
            <ComponentItem
              key={`recent-${comp.name}`}
              component={comp}
              isSelected={comp.name === selectedName}
              isFocused={false}
              onSelect={onSelect}
            />
          ))}
          <div className="cv-list-divider" />
          <div className="cv-list-section-header">All Components</div>
        </>
      )}
      {components.map((comp, i) => (
        <ComponentItem
          key={comp.name + comp.filePath}
          component={comp}
          isSelected={comp.name === selectedName}
          isFocused={i === focusIndex}
          onSelect={onSelect}
        />
      ))}
      {components.length === 0 && (
        <div className="cv-list-empty">No components found</div>
      )}
    </div>
  )
}

function ComponentItem({
  component,
  isSelected,
  isFocused,
  onSelect,
}: {
  component: ComponentEntry & { load: () => Promise<unknown> }
  isSelected: boolean
  isFocused: boolean
  onSelect: (component: ComponentEntry & { load: () => Promise<unknown> }) => void
}) {
  const classes = [
    'cv-component-item',
    isSelected && 'cv-component-item-selected',
    isFocused && 'cv-component-item-focused',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} onClick={() => onSelect(component)} type="button">
      <span className="cv-component-name">{component.name}</span>
      <span className="cv-component-path">{component.filePath}</span>
      <span className="cv-component-badge">
        {component.exportType === 'default' ? 'default' : 'named'}
      </span>
    </button>
  )
}
