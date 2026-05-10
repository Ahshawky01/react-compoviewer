import { Button } from './components/Button'
import Card from './components/Card'
import { Input } from './components/Input'

export function App() {
  return (
    <div style={{ padding: 32, fontFamily: 'system-ui', maxWidth: 600 }}>
      <h1>CompoViewer Example</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Press <kbd>Ctrl+Shift+V</kbd> to open the component viewer.
      </p>

      <Card title="Sample Components">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Name" placeholder="Enter your name" />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary">Submit</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">Reset</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
