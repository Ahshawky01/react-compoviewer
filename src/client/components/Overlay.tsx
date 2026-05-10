import { useState, useRef, useCallback, useEffect } from 'react'
import type { ComponentEntry, PanelConfig } from '../../types.js'
import { SearchBar } from './SearchBar.js'
import { ComponentList } from './ComponentList.js'
import { Preview } from './Preview.js'
import { PropsEditor } from './PropsEditor.js'
import { useComponentSearch, useRegistry } from '../hooks/useRegistry.js'
import { useRecent } from '../hooks/useRecent.js'
import { useComponentLoader } from '../hooks/useComponentLoader.js'

interface OverlayProps {
  isOpen: boolean
  onClose: () => void
  panelConfig: PanelConfig
}

export function Overlay({ isOpen, onClose, panelConfig }: OverlayProps) {
  const { Wrapper } = useRegistry()
  const [query, setQuery] = useState('')
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null)
  const [selectedProps, setSelectedProps] = useState<
    ComponentEntry['props']
  >([])
  const [propValues, setPropValues] = useState<Record<string, unknown>>({})
  const [focusIndex, setFocusIndex] = useState(0)
  const [panelWidth, setPanelWidth] = useState(panelConfig.defaultWidth)

  const results = useComponentSearch(query)
  const { recents, addRecent } = useRecent()
  const { Component, loading, error, load } = useComponentLoader()

  const resizeRef = useRef<{
    startX: number
    startWidth: number
  } | null>(null)

  useEffect(() => {
    setFocusIndex(0)
  }, [query])

  const handleSelect = useCallback(
    (comp: ComponentEntry & { load: () => Promise<unknown> }) => {
      setSelectedName(comp.name)
      setSelectedFilePath(comp.filePath)
      setSelectedProps(comp.props)

      const defaults: Record<string, unknown> = {}
      for (const p of comp.props) {
        if (p.defaultValue !== undefined) defaults[p.name] = p.defaultValue
      }
      setPropValues(defaults)

      addRecent(comp.name)
      load(comp.name, comp.load as () => Promise<React.ComponentType<Record<string, unknown>>>)
    },
    [addRecent, load],
  )

  const handlePropChange = useCallback((name: string, value: unknown) => {
    setPropValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handlePropReset = useCallback(() => {
    const defaults: Record<string, unknown> = {}
    for (const p of selectedProps) {
      if (p.defaultValue !== undefined) defaults[p.name] = p.defaultValue
    }
    setPropValues(defaults)
  }, [selectedProps])

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      resizeRef.current = { startX: e.clientX, startWidth: panelWidth }

      function onMouseMove(e: MouseEvent) {
        if (!resizeRef.current) return
        const isRight = panelConfig.position === 'right'
        const diff = isRight
          ? resizeRef.current.startX - e.clientX
          : e.clientX - resizeRef.current.startX
        const newWidth = Math.min(
          Math.max(resizeRef.current.startWidth + diff, panelConfig.minWidth),
          panelConfig.maxWidth,
        )
        setPanelWidth(newWidth)
      }

      function onMouseUp() {
        resizeRef.current = null
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [panelWidth, panelConfig],
  )

  if (!isOpen) return null

  const positionStyles =
    panelConfig.position === 'right'
      ? { right: 0, left: 'auto' as const }
      : { left: 0, right: 'auto' as const }

  return (
    <>
      <div className="cv-backdrop" onClick={onClose} />
      <div
        className="cv-drawer"
        style={{
          width: panelWidth,
          ...positionStyles,
        }}
      >
        <div
          className="cv-resize-handle"
          onMouseDown={handleResizeStart}
          style={{
            [panelConfig.position === 'right' ? 'left' : 'right']: 0,
          }}
        />

        <div className="cv-drawer-header">
          <span className="cv-drawer-title">CompoViewer</span>
          <button
            className="cv-btn cv-btn-ghost cv-btn-sm"
            onClick={onClose}
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="cv-drawer-body">
          <div className="cv-sidebar">
            <SearchBar
              value={query}
              onChange={setQuery}
              onEscape={onClose}
              onArrowDown={() => setFocusIndex(0)}
              isOpen={isOpen}
            />
            <ComponentList
              components={results}
              selectedName={selectedName}
              onSelect={handleSelect}
              focusIndex={focusIndex}
              onFocusChange={setFocusIndex}
              recentNames={recents}
              showRecent={!query}
            />
          </div>

          <div className="cv-main">
            <Preview
              Component={Component}
              componentName={selectedName}
              filePath={selectedFilePath}
              props={propValues}
              Wrapper={Wrapper}
              loading={loading}
              loadError={error}
            />
            {selectedName && (
              <PropsEditor
                props={selectedProps}
                values={propValues}
                onChange={handlePropChange}
                onReset={handlePropReset}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
