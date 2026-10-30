/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/configuracion_pruebas.ts'],
    env: {
      VITE_API_URL: 'http://localhost:3000/api/v1',
    },
  },
});