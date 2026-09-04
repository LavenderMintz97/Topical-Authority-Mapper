// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  return {
    // 🔑 Base path: '/Topical-Authority-Mapper/' for GitHub Pages production build, '/' for local dev
    base: mode === 'production' ? '/Topical-Authority-Mapper/' : '/',

    plugins: [
      react(),
      tailwindcss(),
    ],

    // ✅ REMOVE the define block - Vite auto-exposes VITE_* vars via import.meta.env
    // The old define block caused conflicts with env var injection

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