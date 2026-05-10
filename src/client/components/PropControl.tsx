import type { PropInfo } from '../../types.js'

interface PropControlProps {
  prop: PropInfo
  value: unknown
  onChange: (value: unknown) => void
}

export function PropControl({ prop, value, onChange }: PropControlProps) {
  const label = (
    <label className="cv-prop-label">
      <span className="cv-prop-name">{prop.name}</span>
      <span className="cv-prop-type">{formatType(prop)}</span>
      {prop.required && <span className="cv-prop-required">*</span>}
    </label>
  )

  switch (prop.type) {
    case 'string':
    case 'ReactNode':
      return (
        <div className="cv-prop-row">
          {label}
          <input
            className="cv-input"
            type="text"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              prop.defaultValue != null ? String(prop.defaultValue) : undefined
            }
          />
        </div>
      )

    case 'number':
      return (
        <div className="cv-prop-row">
          {label}
          <input
            className="cv-input"
            type="number"
            value={value != null ? Number(value) : ''}
            onChange={(e) =>
              onChange(e.target.value === '' ? undefined : Number(e.target.value))
            }
          />
        </div>
      )

    case 'boolean':
      return (
        <div className="cv-prop-row">
          {label}
          <button
            className={`cv-toggle ${value ? 'cv-toggle-on' : ''}`}
            onClick={() => onChange(!value)}
            type="button"
          >
            <span className="cv-toggle-thumb" />
          </button>
        </div>
      )

    case 'union':
      return (
        <div className="cv-prop-row">
          {label}
          <select
            className="cv-select"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value || undefined)}
          >
            <option value="">— select —</option>
            {prop.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )

    case 'function':
      return (
        <div className="cv-prop-row">
          {label}
          <button
            className="cv-btn cv-btn-secondary cv-btn-sm"
            onClick={() => console.log(`[CompoViewer] ${prop.name} called`)}
            type="button"
          >
            Trigger
          </button>
        </div>
      )

    case 'json':
      return (
        <div className="cv-prop-row cv-prop-row-col">
          {label}
          <textarea
            className="cv-textarea"
            value={
              typeof value === 'string' ? value : JSON.stringify(value, null, 2)
            }
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {
                onChange(e.target.value)
              }
            }}
            rows={3}
          />
        </div>
      )

    default:
      return null
  }
}

function formatType(prop: PropInfo): string {
  if (prop.type === 'union' && prop.options) {
    return prop.options.join(' | ')
  }
  return prop.type
}
