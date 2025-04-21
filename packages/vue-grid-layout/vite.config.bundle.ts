import { resolve } from 'node:path';
import { generateExternal } from '@elora-cloud/elora-cli';
import vue from '@vitejs/plugin-vue';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      external: generateExternal({ full: true, packagePath: resolve(__dirname, './package.json') }),
      // 确保外部化处理那些你不想打包进库的依赖
      output: {},
    },
    lib: {
      entry: 'src/index.ts',
      formats: ['umd', 'cjs', 'es'],
      name: 'vue-grid-layout',
    },
  },
});
