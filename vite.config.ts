import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig(({mode}) => {
  // loadEnv is kept if you need it for other config logic
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // ✅ NO define block needed - Vite auto-exposes VITE_* vars via import.meta.env
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