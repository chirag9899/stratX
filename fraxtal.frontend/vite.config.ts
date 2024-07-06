import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: true,
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ['path'],
      exclude: ['http'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      overrides: {
        fs: 'memfs'
      },
      protocolImports: true
    })
  ],
})
