import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true,
    port: 5173,
    watch: {
      // Needed for file-change detection on Docker bind mounts (esp. Windows hosts).
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
  },
})
