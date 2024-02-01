import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "node:path"
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    minify: true,
    rollupOptions: {
      external: ["vue"],
      output: {
        exports: "named",
        globals: {
          vue: "Vue"
        }
      }
    },
    lib: {
      entry: "src/index.ts",
      formats: ["umd", "cjs", "es"],
      name: "vue-grid-layout"
    }
  }
})
