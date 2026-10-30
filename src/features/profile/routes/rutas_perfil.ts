import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

export const rutasPerfil: RutaAplicacion[] = [
  {
    path: RUTAS.perfil,
    handle: { titulo: 'Mi perfil' },
    lazy: async () => {
      const { PaginaPerfil } = await import('../pages/pagina_perfil');
      return { Component: PaginaPerfil };
    },
  },
];
