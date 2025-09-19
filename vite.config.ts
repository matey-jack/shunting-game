import {defineConfig} from 'vite'
import preact from '@preact/preset-vite'

// Allow setting the base path via environment variable for GitHub Pages subpath hosting
// On GitHub Actions we set BASE to "/<repo-name>/" so assets resolve correctly.
const base = process.env.BASE || '/'

export default defineConfig({
    base,
    plugins: [preact()],
    test: {
        environment: 'jsdom'
    }
})
