import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the same build works on GitHub Pages project sites
// (https://user.github.io/repo/) and on any custom domain.
export default defineConfig({
  base: './',
  plugins: [react()],
})
