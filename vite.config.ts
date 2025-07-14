import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const BASE_URL = 'http://localhost:8080';
// const BASE_URL = 'https://api.woori-zip.lastdance.store/';

export default defineConfig({
  plugins: [react()],
  server: {
    // port: 3000,
      proxy: {
      '/api': {
        target: BASE_URL,
        changeOrigin: true,
        secure: false
      },
      '/oauth2': {
        target: BASE_URL,
        changeOrigin: true,
        secure: false
      },

    },
    // 개발 서버 최적화
    hmr: {
      overlay: false
    }
  },
  // 빌드 시에는 프록시 설정 무시됨 (운영환경에서는 실제 도메인 사용)
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // 빌드 최적화 설정
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react', 'react-hot-toast'],
          charts: ['recharts'],
          editor: ['react-quill', 'quill'],
          dnd: ['react-beautiful-dnd', 'react-dnd', 'react-dnd-html5-backend']
        }
      },
    },
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 0,
  },
});
