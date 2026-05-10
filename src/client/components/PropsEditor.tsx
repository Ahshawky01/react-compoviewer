import { PropControl } from './PropControl.js'
import type { PropInfo } from '../../types.js'

interface PropsEditorProps {
  props: PropInfo[]
  values: Record<string, unknown>
  onChange: (name: string, value: unknown) => void
  onReset: () => void
}

export function PropsEditor({
  props,
  values,
  onChange,
  onReset,
}: PropsEditorProps) {
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
