import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

export const rutasUsuarios: RutaAplicacion[] = [
  {
    path: RUTAS.usuarios,
    handle: { titulo: 'Usuarios', roles: ['administrador'] },
    lazy: async () => {
      const { PaginaUsuarios } = await import('../pages/pagina_usuarios');
      return { Component: PaginaUsuarios };
    },
  },
];
