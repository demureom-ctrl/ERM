import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/ERM/',
  server: {
    host: true, // Listen on all local IPs
    port: 5173,
  }
}))
