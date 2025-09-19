import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
    build: {
        // because Github pages only takes it from here
        outDir: 'docs',
    },
  test: {
    environment: 'jsdom'
  }
})
