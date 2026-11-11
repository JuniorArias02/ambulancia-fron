import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

export const rutasVerificaciones: RutaAplicacion[] = [
  {
    path: RUTAS.verificaciones,
    handle: { titulo: 'Verificación de ciudadanos', roles: ['administrador'] },
    lazy: async () => {
      const { PaginaVerificaciones } = await import('../pages/pagina_verificaciones');
      return { Component: PaginaVerificaciones };
    },
  },
  {
    path: RUTAS.detalleVerificacion,
    handle: { titulo: 'Revisión de identidad', roles: ['administrador'] },
    lazy: async () => {
      const { PaginaDetalleVerificacion } = await import('../pages/pagina_detalle_verificacion');
      return { Component: PaginaDetalleVerificacion };
    },
  },
];
