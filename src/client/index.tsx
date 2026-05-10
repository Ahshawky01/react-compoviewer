import { createRoot } from 'react-dom/client'
import { App } from './App.js'
import type { ComponentEntry, PanelConfig } from '../types.js'
import type React from 'react'

interface LoadableEntry extends ComponentEntry {
  load: () => Promise<React.ComponentType<Record<string, unknown>>>
}

interface MountOptions {
  registry: LoadableEntry[]
  config: { shortcut: string; panel: PanelConfig }
  Wrapper: React.ComponentType<{ children: React.ReactNode }> | null
}

const CONTAINER_ID = 'compoviewer-root'

export function mountCompoViewer(options: MountOptions) {
  if (typeof document === 'undefined') return

  let container = document.getElementById(CONTAINER_ID)
  if (container) return

  container = document.createElement('div')
  container.id = CONTAINER_ID
  container.setAttribute('data-compoviewer', '')
  document.body.appendChild(container)

  injectStyles()

  const root = createRoot(container)
  root.render(
    <App
      registry={options.registry}
      config={options.config}
      Wrapper={options.Wrapper}
    />,
  )
}

function injectStyles() {
  if (document.getElementById('compoviewer-styles')) return

  const style = document.createElement('style')
  style.id = 'compoviewer-styles'
  style.textContent = STYLES
  document.head.appendChild(style)
}

const STYLES = `
[data-compoviewer] {
  --cv-bg: #0f0f1a;
  --cv-surface: #1a1a2e;
  --cv-surface-hover: #1f1f3a;
  --cv-border: #2a2a4a;
  --cv-text: #e0e0ee;
  --cv-text-muted: #8888aa;
  --cv-accent: #6366f1;
  --cv-accent-hover: #818cf8;
  --cv-error: #ef4444;
  --cv-success: #22c55e;
  --cv-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --cv-mono: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  --cv-radius: 6px;
  --cv-radius-sm: 4px;

  font-family: var(--cv-font);
  font-size: 13px;
  line-height: 1.5;
  color: var(--cv-text);
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 99999;
}

[data-compoviewer] *, [data-compoviewer] *::before, [data-compoviewer] *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.cv-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99998;
}

.cv-drawer {
  position: fixed;
  top: 0;
  height: 100vh;
  background: var(--cv-bg);
  border-left: 1px solid var(--cv-border);
  display: flex;
  flex-direction: column;
  z-index: 99999;
  animation: cv-slide-in 0.2s ease-out;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
}

@keyframes cv-slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.cv-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 10;
  background: transparent;
  transition: background 0.15s;
}

.cv-resize-handle:hover {
  background: var(--cv-accent);
}

.cv-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--cv-border);
  flex-shrink: 0;
}

.cv-drawer-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--cv-accent);
}

.cv-drawer-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.cv-sidebar {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--cv-border);
  max-height: 45%;
  overflow: hidden;
}

.cv-main {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Search */
.cv-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--cv-border);
}

.cv-search-icon {
  flex-shrink: 0;
  color: var(--cv-text-muted);
}

.cv-search-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--cv-text);
  font-size: 13px;
  font-family: var(--cv-font);
  outline: none;
}

.cv-search-input::placeholder {
  color: var(--cv-text-muted);
}

.cv-search-clear {
  background: none;
  border: none;
  color: var(--cv-text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
  line-height: 1;
}

/* Component List */
.cv-component-list {
  overflow-y: auto;
  flex: 1;
}

.cv-list-section-header {
  padding: 6px 12px 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--cv-text-muted);
}

.cv-list-divider {
  height: 1px;
  background: var(--cv-border);
  margin: 4px 0;
}

.cv-component-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  background: none;
  border: none;
  color: var(--cv-text);
  font-family: var(--cv-font);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.cv-component-item:hover,
.cv-component-item-focused {
  background: var(--cv-surface-hover);
}

.cv-component-item-selected {
  background: var(--cv-surface);
  border-left: 2px solid var(--cv-accent);
}

.cv-component-name {
  font-weight: 500;
  flex-shrink: 0;
}

.cv-component-path {
  color: var(--cv-text-muted);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.cv-component-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--cv-surface);
  color: var(--cv-text-muted);
  flex-shrink: 0;
}

.cv-list-empty {
  padding: 20px 12px;
  text-align: center;
  color: var(--cv-text-muted);
}

/* Preview */
.cv-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cv-preview-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--cv-border);
}

.cv-preview-name {
  font-weight: 600;
  font-size: 14px;
}

.cv-preview-path {
  font-size: 11px;
  color: var(--cv-text-muted);
  font-family: var(--cv-mono);
}

.cv-preview-area {
  padding: 16px;
  flex: 1;
  overflow: auto;
  background: var(--cv-surface);
  border-radius: var(--cv-radius);
  margin: 8px;
}

.cv-preview-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--cv-text-muted);
  padding: 40px;
}

.cv-preview-empty-icon {
  font-size: 32px;
  opacity: 0.5;
}

.cv-preview-empty-text {
  font-size: 14px;
}

.cv-preview-empty-hint {
  font-size: 12px;
  opacity: 0.6;
}

.cv-preview-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--cv-text-muted);
}

/* Props Editor */
.cv-props-editor {
  border-top: 1px solid var(--cv-border);
  flex-shrink: 0;
}

.cv-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid var(--cv-border);
}

.cv-section-title {
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--cv-text-muted);
}

.cv-props-list {
  padding: 8px 14px 14px;
}

.cv-prop-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.cv-prop-row-col {
  flex-direction: column;
  align-items: stretch;
}

.cv-prop-label {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 100px;
  flex-shrink: 0;
}

.cv-prop-name {
  font-family: var(--cv-mono);
  font-size: 12px;
  color: var(--cv-text);
}

.cv-prop-type {
  font-size: 10px;
  color: var(--cv-text-muted);
  font-family: var(--cv-mono);
}

.cv-prop-required {
  color: var(--cv-error);
  font-size: 12px;
}

.cv-empty-props {
  padding: 12px 14px;
  color: var(--cv-text-muted);
  font-size: 12px;
  text-align: center;
  border-top: 1px solid var(--cv-border);
}

/* Controls */
.cv-input, .cv-select, .cv-textarea {
  flex: 1;
  background: var(--cv-surface);
  border: 1px solid var(--cv-border);
  border-radius: var(--cv-radius-sm);
  color: var(--cv-text);
  font-family: var(--cv-font);
  font-size: 12px;
  padding: 4px 8px;
  outline: none;
  transition: border-color 0.15s;
}

.cv-input:focus, .cv-select:focus, .cv-textarea:focus {
  border-color: var(--cv-accent);
}

.cv-textarea {
  font-family: var(--cv-mono);
  resize: vertical;
  min-height: 60px;
}

.cv-select {
  cursor: pointer;
}

.cv-toggle {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--cv-border);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.cv-toggle-on {
  background: var(--cv-accent);
}

.cv-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
}

.cv-toggle-on .cv-toggle-thumb {
  transform: translateX(16px);
}

/* Buttons */
.cv-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--cv-radius-sm);
  border: none;
  font-family: var(--cv-font);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.cv-btn-secondary {
  background: var(--cv-surface);
  color: var(--cv-text);
  border: 1px solid var(--cv-border);
}

.cv-btn-secondary:hover {
  background: var(--cv-surface-hover);
}

.cv-btn-ghost {
  background: none;
  color: var(--cv-text-muted);
}

.cv-btn-ghost:hover {
  color: var(--cv-text);
  background: var(--cv-surface-hover);
}

.cv-btn-sm {
  padding: 2px 8px;
  font-size: 12px;
}

/* Error */
.cv-error-panel {
  padding: 16px;
  margin: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--cv-radius);
}

.cv-error-title {
  font-weight: 600;
  color: var(--cv-error);
  margin-bottom: 8px;
}

.cv-error-message {
  font-family: var(--cv-mono);
  font-size: 12px;
  color: var(--cv-error);
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.cv-error-stack {
  font-family: var(--cv-mono);
  font-size: 10px;
  color: var(--cv-text-muted);
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 8px;
}

/* Spinner */
.cv-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--cv-border);
  border-top-color: var(--cv-accent);
  border-radius: 50%;
  animation: cv-spin 0.6s linear infinite;
}

@keyframes cv-spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .cv-drawer {
    width: 100vw !important;
  }
}
`
