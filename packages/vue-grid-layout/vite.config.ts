import {defineConfig} from "vite"
import {resolve} from "node:path"
import vue from "@vitejs/plugin-vue"
import copy from "rollup-plugin-copy"

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "./src/components/index.ts"),
      formats: ["es", "cjs"],
      name: "vue-grid-layout"
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        exports: "named",
        globals: {
          vue: "Vue"
        }
      }
    }
  },
  plugins: [
    vue(),
    copy({
      targets: [
        {
          src: "src/global.d.ts",
          dest: "dist"
        }
      ],
      hook: "writeBundle"
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  }
})
