import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compoviewer } from 'react-compoviewer/vite'

export default defineConfig({
  plugins: [react(), compoviewer()],
})
