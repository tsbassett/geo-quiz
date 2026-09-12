import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative paths so the built site works from any web folder.
  base: './',
  // Lets an iPad on the same Wi-Fi open the dev server.
  server: { host: true },
})
