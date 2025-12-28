import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment
  // Set via VITE_BASE_PATH environment variable, defaults to empty string (root)
  base: (process.env.VITE_BASE_PATH as string) || '',
})
