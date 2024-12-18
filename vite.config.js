import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  root: "src/renderer",
  build: {
    target: "esnext", // 目标浏览器版本
    outDir: "dist", // 输出目录
  },
  css: {
    preprocessorOptions: {
      scss: { api: "modern-compiler" },
    },
  },
  server: {
    port: 3000,
  },
});
