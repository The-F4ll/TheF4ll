import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 5173,
    host: true
  }
})
