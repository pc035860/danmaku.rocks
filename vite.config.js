import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        watch: path.resolve(__dirname, 'watch.html'),
        overlay: path.resolve(__dirname, 'overlay.html'),
        '404': path.resolve(__dirname, '404.html'),
      },
    },
  },
  resolve: {
    alias: {
      jquery: path.resolve(__dirname, 'app/shims/jquery.js'),
      _Danmaku: path.resolve(__dirname, 'app/modules/Danmaku/src/index.js'),
    },
  },
});
