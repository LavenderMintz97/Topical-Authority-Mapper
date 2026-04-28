import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  // 👇 GitHub Pages: use repo name as base path
  base: '/Topical-Authority-Mapper/',
  
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills(),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'node-fetch': 'node-fetch-native',
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});