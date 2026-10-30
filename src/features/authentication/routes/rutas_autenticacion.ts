import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

/** Rutas públicas: solo accesibles sin sesión iniciada. */
export const rutasAutenticacion: RutaAplicacion[] = [
  {
    path: RUTAS.iniciarSesion,
    lazy: async () => {
      const { PaginaIniciarSesion } = await import('../pages/pagina_iniciar_sesion');
      return { Component: PaginaIniciarSesion };
    },
  },
];
