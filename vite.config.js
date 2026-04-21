import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // 모바일 기기에서 로컬 네트워크로 접속하려면 host: true 필요
    host: true,
    port: 5173,
    open: false,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 데모 목적이므로 번들 경고는 무시
    chunkSizeWarningLimit: 1500,
  },
});
