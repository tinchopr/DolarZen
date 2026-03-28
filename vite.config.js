import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: replace 'dolarzen' with your actual repository name
// If deploying to username.github.io, use base: '/'
// If deploying to username.github.io/repo-name, use base: '/repo-name/'
export default defineConfig({
  plugins: [react()],
  base: '/DolarZen/',
})
