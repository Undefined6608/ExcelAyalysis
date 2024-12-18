import { defineConfig } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  main: {
    build: {
      outDir: "dist/main",
      entry: "src/main/index.js",
    },
  },
  preload: {
    build: {
      outDir: "dist/preload",
      entry: "src/preload/index.js",
    },
  },
  renderer: {
    plugins: [vue()],
    root: "src/renderer",
    css: {
      preprocessorOptions: {
        scss: { api: "modern-compiler" },
      },
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: "dist/renderer",
    },
    resolve: {
      alias: {
        "@": resolve("src/renderer"),
      },
    },
  },
});
