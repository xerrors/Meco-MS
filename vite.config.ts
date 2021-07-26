import { defineConfig } from 'vite';
import { resolve } from 'path';

import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 键必须以斜线开始和结束
      '/@/': resolve(__dirname, './src')
      // '/@components/': path.resolve(__dirname, './src/components')
    },
  },
  optimizeDeps: {
    include: [
      'axios',
      'js-cookie',
      '@kangc/v-md-editor/lib/base-editor.js',
      '@kangc/v-md-editor/lib/theme/github.js',
    ]
  },
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'https://www.xerrors.fun:5000/',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`
      },
      less: {
        additionalData: `$primary-color: red;`
      }
    }
  }
})
