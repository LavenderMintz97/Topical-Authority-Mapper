// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  return {
    // 🔑 Critical: Base path for GitHub Pages subdirectory hosting
    base: '/Topical-Authority-Mapper/',

    // 🧩 Plugins
    plugins: [
      react(),
      tailwindcss(),
    ],

    // 🔗 Path aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'node-fetch': 'node-fetch-native',
      },
    },

    // 🌐 Server config (development only)
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },

    // 📦 Build optimization (optional but recommended)
    build: {
      outDir: 'dist',
      sourcemap: false, // Set to true for debugging
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };
});