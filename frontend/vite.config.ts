import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow setting a base path at build time via VITE_BASE (e.g. '/ebpb/')
  base: process.env.VITE_BASE || '/',
  server: {
    port: 5173,
    proxy: {
      // during development keep proxying /api to local backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
