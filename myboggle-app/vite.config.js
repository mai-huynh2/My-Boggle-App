import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      "arrowleft-galileocuba-5173.codio.io"
    ],
    proxy: {
      '/api': {
        target: 'https://arrowleft-galileocuba-8000.codio.io',
        changeOrigin: true,
        secure: false
      }
    }
  }
})