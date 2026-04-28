import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // 👇 REQUIRED for GitHub Pages at /Topical-Authority-Mapper/
    base: '/Topical-Authority-Mapper/',
    
    plugins: [
      react(),
      tailwindcss(),
      nodePolyfills(), // 👈 Added - you imported it but didn't use it
    ],
    
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 👈 Fixed: point to src folder
        'node-fetch': 'node-fetch-native',
      },
    },
    
    // Server config only affects dev mode (npm run dev)
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
