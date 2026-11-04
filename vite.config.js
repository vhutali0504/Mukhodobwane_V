import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    manifest: true,
    // The lazy /room scene chunk (three.js, R3F, drei, postprocessing) is about
    // 1.06 MB minified / 290 kB gzip and loads only on /room. Splitting it with
    // manualChunks made the formal entry import the vendor chunks, so it stays
    // one chunk and the limit sits just above it (docs/DECISIONS.md).
    chunkSizeWarningLimit: 1100,
  },
  test: {
    root: '.',
    environment: 'jsdom',
    setupFiles: ['tests/unit/setup.js'],
    include: ['tests/unit/**/*.test.{js,jsx}'],
  },
})
