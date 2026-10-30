import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

export const rutasDashboard: RutaAplicacion[] = [
  {
    path: RUTAS.inicio,
    handle: { titulo: 'Inicio', disposicion: 'lienzo' },
    lazy: async () => {
      const { PaginaInicio } = await import('../pages/pagina_inicio');
      return { Component: PaginaInicio };
    },
  },
];
