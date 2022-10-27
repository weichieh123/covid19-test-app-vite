import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@IMG': path.resolve(__dirname, './src/assets/img'),
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      '@CSS': path.resolve(__dirname, 'src/style')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
})
