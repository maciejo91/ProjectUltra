import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    // Allow resolving files from node_modules even if not exported
    dedupe: ['vue']
  },
  // Configure optimizeDeps to handle the CSS file
  optimizeDeps: {
    include: ['@motork/component-library']
  },
  server: {
    // Bind explicitly to IPv4 loopback so `http://127.0.0.1:<port>` works reliably on macOS
    // (otherwise Vite may listen only on `::1`, which breaks tools/browsers that hit IPv4).
    host: '127.0.0.1',
    port: 5000,
    strictPort: true
  }
})
