import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    base: '/Topical-Authority-Mapper/',  // ← REQUIRED for GitHub Pages
    
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
    
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
