/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const variables = loadEnv(mode, process.cwd(), 'VITE_');
  // Subcarpeta en la que se publica la web (ej. /ambulancia/). En desarrollo, la raíz.
  const rutaBase = variables.VITE_RUTA_BASE?.trim() || '/';

  return {
    base: rutaBase.endsWith('/') ? rutaBase : `${rutaBase}/`,
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
  };
});
