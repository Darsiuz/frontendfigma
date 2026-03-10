import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@@': path.resolve(__dirname, './src/app'),
      '@components': path.resolve(__dirname, './src/app/components'),
      '@type': path.resolve(__dirname, './src/app/types'),
      '@utils': path.resolve(__dirname, './src/app/utils'),
      '@services': path.resolve(__dirname, './src/app/services'),
      '@hooks': path.resolve(__dirname, './src/app/hooks'),
      '@context': path.resolve(__dirname, './src/app/context'),
      '@features': path.resolve(__dirname, './src/app/features'),
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __APP_LICENSE__: JSON.stringify(packageJson.license),

  },
})
