// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'], // pre-bundle heavy deps
    exclude: [] // anything you don’t want pre-bundled
  },
  server: {
    host: '0.0.0.0',
    port: 8680,
    strictPort: true
  }
})