import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Backend dev server (align with uvicorn --port)
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
