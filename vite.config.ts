import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production'
  return {
    plugins: [react()],
    base: isProd ? '/Finance-Management-Web/' : '/',
  }
})
