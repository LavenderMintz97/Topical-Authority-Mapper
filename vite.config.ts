import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // 👇 Try WITHOUT trailing slash or use relative path
    base: mode === 'development' ? '/' : '/Topical-Authority-Mapper/',
    
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
      sourcemap: true,
    },
    
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});