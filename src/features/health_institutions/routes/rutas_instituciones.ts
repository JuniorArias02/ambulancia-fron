import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

/** Todos los roles consultan; solo el administrador gestiona (lo decide la página). */
export const rutasInstituciones: RutaAplicacion[] = [
  {
    path: RUTAS.instituciones,
    handle: { titulo: 'Instituciones de salud' },
    lazy: async () => {
      const { PaginaInstituciones } = await import('../pages/pagina_instituciones');
      return { Component: PaginaInstituciones };
    },
  },
];
