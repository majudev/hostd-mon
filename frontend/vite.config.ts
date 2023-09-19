// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // Map the custom paths to their respective directories
      '@/api': '/src/api',
      '@/assets': '/src/assets',
      '@/components': '/src/components',
      '@/config': '/src/config',
      '@/context': '/src/context',
      '@/hooks': '/src/hooks',
      '@/pages': '/src/pages',
      '@/styles': '/src/styles',
      '@/types': '/src/types',
      '@/utils': '/src/utils'
    },
  },
  server: {
    open: true, // Open the browser when starting Vite development server
  },
  build: {
    // Your build configuration options here
  },
});
