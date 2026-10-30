import { RUTAS } from '../../../constants/rutas';
import type { NombreRol } from '../../../types/rol.types';
import type { RutaAplicacion } from '../../../types/ruta.types';

export const ROLES_AMBULANCIAS: readonly NombreRol[] = ['administrador', 'despachador'];

export const rutasAmbulancias: RutaAplicacion[] = [
  {
    path: RUTAS.ambulancias,
    handle: { titulo: 'Ambulancias', roles: ROLES_AMBULANCIAS },
    lazy: async () => {
      const { PaginaAmbulancias } = await import('../pages/pagina_ambulancias');
      return { Component: PaginaAmbulancias };
    },
  },
  {
    path: RUTAS.detalleAmbulancia,
    handle: { titulo: 'Detalle de ambulancia', roles: ROLES_AMBULANCIAS },
    lazy: async () => {
      const { PaginaDetalleAmbulancia } = await import('../pages/pagina_detalle_ambulancia');
      return { Component: PaginaDetalleAmbulancia };
    },
  },
];
