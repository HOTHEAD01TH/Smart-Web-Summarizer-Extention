import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        background: 'src/background.js',
        contentScript: 'src/contentScript.js'
      },
      output: {
        entryFileNames: '[name].js',
        dir: 'dist'
      }
    }
  }
});