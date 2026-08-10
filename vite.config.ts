import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const cloudOrigin = process.env.ZML_CLOUD_DEV_ORIGIN ?? 'http://localhost:8080'

const cloudProxy = {
  target: cloudOrigin,
  changeOrigin: true,
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': cloudProxy,
      '/oauth2': cloudProxy,
      '/login': cloudProxy,
      '/logout': cloudProxy,
      '/error': cloudProxy,
    },
  },
})
