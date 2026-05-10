import { PropControl } from './PropControl.js'
import type { PropInfo } from '../../types.js'

interface PropsEditorProps {
  props: PropInfo[]
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
  onReset: () => void
  loading?: boolean
}

export function PropsEditor({
  props,
  values,
  onChange,
  onReset,
  loading,
}: PropsEditorProps) {
  if (loading) {
    return (
      <div className="cv-empty-props">
        <div className="cv-spinner" style={{ width: 14, height: 14 }} />
        <span style={{ marginLeft: 8 }}>Loading props...</span>
      </div>
    )
  }

  if (props.length === 0) {
    return <div className="cv-empty-props">No editable props</div>
  }

  return (
    <div className="cv-props-editor">
      <div className="cv-section-header">
        <span className="cv-section-title">Props</span>
        <button
          className="cv-btn cv-btn-ghost cv-btn-sm"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>
      <div className="cv-props-list">
        {props.map((prop) => (
          <PropControl
            key={prop.name}
            prop={prop}
            value={values[prop.name]}
            onChange={(val) => onChange(prop.name, val)}
          />
        ))}
      </div>
    </div>
  )
}
