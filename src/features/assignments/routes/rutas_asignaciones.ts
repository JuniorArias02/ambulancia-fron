import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

export const rutasAsignaciones: RutaAplicacion[] = [
  {
    path: RUTAS.servicios,
    handle: { titulo: 'Servicios en curso', roles: ['administrador', 'despachador'] },
    lazy: async () => {
      const { PaginaServicios } = await import('../pages/pagina_servicios');
      return { Component: PaginaServicios };
    },
  },
];
