import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // ✅ ADD THIS LINE - tells Vite where the site will be hosted
    base: '/Topical-Authority-Mapper/',
    
    plugins: [
      react(),
      tailwindcss(),
    ],
    // Remove this define block if it exists (causes conflicts)
    // define: {
    //   'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    // },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'node-fetch': 'node-fetch-native',
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});