import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/analyze': 'http://127.0.0.1:8000',
      '/outputs': 'http://127.0.0.1:8000',
      '/download': 'http://127.0.0.1:8000',
      '/save-latex': 'http://127.0.0.1:8000',
      '/compile-pdf': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
    }
  }
})
