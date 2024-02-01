import {defineConfig} from "vite"
import {resolve} from "node:path"
import vue from "@vitejs/plugin-vue"
import dts from "vite-plugin-dts"

export default defineConfig({
  build: {
    target: "modules",
    outDir: "es",
    emptyOutDir: false,
    minify: true,
    // 这一块是不会被使用的
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: (id, parent, isResolved) => {
        const ex = ["vue", "element-resize-detector", "mitt"]
        if (ex.includes(id)) {
          return true
        } else if (id.includes("interactjs")) {
          return true
        }
        return false
      },
      // external:['vue'],
      input: ["src/index.ts"],
      output: [
        // esm
        {
          format: "es",
          dir: "es",
          entryFileNames: "[name].js",
          preserveModules: true,
          preserveModulesRoot: "src"
        },
        // cjs
        {
          format: "cjs",
          dir: "lib",
          entryFileNames: "[name].js",
          preserveModules: true,
          preserveModulesRoot: "src"
        }
      ]
    }
  },
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  }
})
