import { RUTAS } from '../../../constants/rutas';
import type { NombreRol } from '../../../types/rol.types';
import type { RutaAplicacion } from '../../../types/ruta.types';

const ROLES_EMERGENCIAS: readonly NombreRol[] = ['administrador', 'despachador'];

export const rutasEmergencias: RutaAplicacion[] = [
  {
    path: RUTAS.emergencias,
    handle: { titulo: 'Emergencias', roles: ROLES_EMERGENCIAS },
    lazy: async () => {
      const { PaginaEmergencias } = await import('../pages/pagina_emergencias');
      return { Component: PaginaEmergencias };
    },
  },
  {
    path: RUTAS.detalleEmergencia,
    handle: { titulo: 'Detalle de emergencia', roles: ROLES_EMERGENCIAS },
    lazy: async () => {
      const { PaginaDetalleEmergencia } = await import('../pages/pagina_detalle_emergencia');
      return { Component: PaginaDetalleEmergencia };
    },
  },
];
