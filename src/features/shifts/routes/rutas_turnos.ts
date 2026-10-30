import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

export const rutasTurnos: RutaAplicacion[] = [
  {
    path: RUTAS.turnos,
    handle: { titulo: 'Tripulaciones', roles: ['administrador', 'despachador'] },
    lazy: async () => {
      const { PaginaTurnos } = await import('../pages/pagina_turnos');
      return { Component: PaginaTurnos };
    },
  },
];
