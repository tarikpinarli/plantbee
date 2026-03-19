import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 500,
    },
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:8080',
      '/auth': process.env.VITE_API_URL || 'http://localhost:8080',
      '/plants': process.env.VITE_API_URL || 'http://localhost:8080',
    },
  },
});
