import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // port: 3000,
      proxy: {
      '/api': {
        target: 'https://api.woori-zip.lastdance.store',
        changeOrigin: true,
        secure: false
      },
      '/oauth2': {
        target: 'https://api.woori-zip.lastdance.store',
        changeOrigin: true,
        secure: false
      },

    }
  },
  // 빌드 시에는 프록시 설정 무시됨 (운영환경에서는 실제 도메인 사용)
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Ensure assets have content hash in filename for cache busting
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    assetsInlineLimit: 0,
  },
});
