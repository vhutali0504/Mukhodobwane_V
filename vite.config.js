import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
  test: {
    root: '.',
    environment: 'jsdom',
    setupFiles: ['tests/unit/setup.js'],
    include: ['tests/unit/**/*.test.{js,jsx}'],
  },
})
