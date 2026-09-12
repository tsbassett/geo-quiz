import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // The published site lives at https://tsbassett.github.io/geo-quiz/, so the built
  // app looks for its files under /geo-quiz/. (If the GitHub repository is ever
  // renamed, change this to match, or the published page will load blank.)
  // The local dev server keeps using "/", so http://localhost:5173/ still works.
  base: command === 'build' ? '/geo-quiz/' : '/',
  // Lets an iPad on the same Wi-Fi open the dev server.
  server: { host: true },
}))
