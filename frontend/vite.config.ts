import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const backendTarget = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': { target: backendTarget, changeOrigin: true },
        '/auth': { target: backendTarget, changeOrigin: true },
        '/users': { target: backendTarget, changeOrigin: true },
        '/contracts': { target: backendTarget, changeOrigin: true },
        '/compensations': { target: backendTarget, changeOrigin: true },
        '/vehicles': { target: backendTarget, changeOrigin: true },
        '/payments': { target: backendTarget, changeOrigin: true },
        '/accidents': { target: backendTarget, changeOrigin: true },
      },
    },
  };
});