import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  logLevel: "info", // 'info' | 'warn' | 'error' | 'silent'
  server: {
    host: true,
    port: 5173,
    open: false, // 브라우저 자동 실행
    strictPort: true, // 포트가 사용 중이면 다음 포트를 시도하지 않고 실패
  },
  // 빌드 후에도 새로고침이 작동하도록 설정
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
});
