import { resolve } from 'node:path';
import { generateExternal } from '@elora-cloud/elora-cli';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    target: 'modules',
    outDir: 'es',
    emptyOutDir: true,
    minify: true,
    // 这一块是不会被使用的
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      input: ['src/index.ts'],
      output: [
        // esm
        {
          format: 'esm',
          dir: 'es',
          entryFileNames: '[name].mjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
        // cjs
        {
          format: 'cjs',
          dir: 'lib',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
      ],
      // 确保外部化处理那些你不想打包进库的依赖
      external: generateExternal({ full: true, packagePath: resolve(__dirname, './package.json') }),
    },
  },
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    dedupe: ['vue'],
  },
});
