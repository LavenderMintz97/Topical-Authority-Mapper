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
    
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
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
