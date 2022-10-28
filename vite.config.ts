import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    open: true, // 運行後自動打開瀏覽器
    strictPort: false, // Port被占用時直接退出， false會嘗試連接下一個可用Port
    proxy: {
      '/api': {
          target: 'https://data.nhi.gov.tw',
          ws: true, // 代理的WebSockets
          changeOrigin: true, // 允許websockets跨域
          rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@IMG': path.resolve(__dirname, './src/assets'),
      '@CSS': path.resolve(__dirname, 'src/style')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
})
