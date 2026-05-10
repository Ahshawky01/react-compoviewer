import { Button } from '../components/Button'
import Card from '../components/Card'

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: 'system-ui', maxWidth: 600 }}>
      <h1>CompoViewer Next.js Example</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Press <kbd>Ctrl+Shift+V</kbd> to open the component viewer.
      </p>
      <Card title="Welcome">
        <p>This is a Next.js app with react-compoviewer.</p>
        <div style={{ marginTop: 12 }}>
          <Button>Click me</Button>
        </div>
      </Card>
    </main>
  )
}
