import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // FIX: Make sure BOTH react and tailwindcss plugins are inside this array
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api-gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-gemini/, '')
      }
    }
  }
});