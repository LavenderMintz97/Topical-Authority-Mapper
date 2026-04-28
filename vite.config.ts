import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// vite.config.ts
export default defineConfig({
  // 👇 Try ONE of these:
  base: './',  // Relative paths (often works for GitHub Pages)
  // OR
  base: '/Topical-Authority-Mapper/',  // Absolute path (if repo name matches)
  
  plugins: [react(), tailwindcss(), nodePolyfills()],
  // ... rest of config
});
  
  // 👇 REMOVE base for now - we'll add it back later
  // base: '/Topical-Authority-Mapper/',
  
  build: {
    outDir: 'dist',
  },
});