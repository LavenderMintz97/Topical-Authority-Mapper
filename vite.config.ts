import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'node-fetch': 'node-fetch-native',
    },
  },
  
  // 👇 REMOVE base for now - we'll add it back later
  // base: '/Topical-Authority-Mapper/',
  
  build: {
    outDir: 'dist',
  },
});