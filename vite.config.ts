import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // 👇 REQUIRED for GitHub Pages
    base: '/Topical-Authority-Mapper/',
    
    plugins: [
      react(),
      tailwindcss(),
      nodePolyfills(), // 👈 Added - was imported but not used
    ],
    
    // 👇 REMOVE this block - not needed since geminiService.ts uses import.meta.env
    // define: {
    //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    // },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 👈 Fixed: was '.' should be './src'
        'node-fetch': 'node-fetch-native',
      },
    },
    
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});