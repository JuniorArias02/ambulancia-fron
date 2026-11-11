import { RUTAS } from '../../../constants/rutas';
import type { RutaAplicacion } from '../../../types/ruta.types';

export const rutasListasChequeo: RutaAplicacion[] = [
  {
    path: RUTAS.listasChequeo,
    handle: { titulo: 'Listas de chequeo', roles: ['administrador'] },
    lazy: async () => {
      const { PaginaListasChequeo } = await import('../pages/pagina_listas_chequeo');
      return { Component: PaginaListasChequeo };
    },
  },
  {
    path: RUTAS.detalleListaChequeo,
    handle: { titulo: 'Lista de chequeo', roles: ['administrador'] },
    lazy: async () => {
      const { PaginaListaChequeo } = await import('../pages/pagina_lista_chequeo');
      return { Component: PaginaListaChequeo };
    },
  },
  {
    path: RUTAS.chequeosDiarios,
    handle: { titulo: 'Chequeos diarios', roles: ['administrador', 'despachador'] },
    lazy: async () => {
      const { PaginaChequeosDiarios } = await import('../pages/pagina_chequeos_diarios');
      return { Component: PaginaChequeosDiarios };
    },
  },
];
