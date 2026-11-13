import { RUTAS } from '../../../constants/rutas';
import type { NombreRol } from '../../../types/rol.types';
import type { RutaAplicacion } from '../../../types/ruta.types';

/** Administrador y despachador tienen los mismos permisos en todo el inventario. */
export const ROLES_INVENTARIO: readonly NombreRol[] = ['administrador', 'despachador'];

export const rutasInventario: RutaAplicacion[] = [
  {
    path: RUTAS.inventario,
    handle: { titulo: 'Inventario', roles: ROLES_INVENTARIO },
    lazy: async () => {
      const { PaginaResumenInventario } = await import('../pages/pagina_resumen_inventario');
      return { Component: PaginaResumenInventario };
    },
  },
  {
    path: RUTAS.existencias,
    handle: { titulo: 'Existencias', roles: ROLES_INVENTARIO },
    lazy: async () => {
      const { PaginaExistencias } = await import('../pages/pagina_existencias');
      return { Component: PaginaExistencias };
    },
  },
  {
    path: RUTAS.movimientos,
    handle: { titulo: 'Movimientos', roles: ROLES_INVENTARIO },
    lazy: async () => {
      const { PaginaMovimientos } = await import('../pages/pagina_movimientos');
      return { Component: PaginaMovimientos };
    },
  },
  {
    path: RUTAS.catalogoInventario,
    handle: { titulo: 'Catálogo de inventario', roles: ROLES_INVENTARIO },
    lazy: async () => {
      const { PaginaCatalogo } = await import('../pages/pagina_catalogo');
      return { Component: PaginaCatalogo };
    },
  },
  {
    path: RUTAS.bodegas,
    handle: { titulo: 'Bodegas', roles: ROLES_INVENTARIO },
    lazy: async () => {
      const { PaginaBodegas } = await import('../pages/pagina_bodegas');
      return { Component: PaginaBodegas };
    },
  },
  {
    path: RUTAS.perfilesDotacion,
    handle: { titulo: 'Perfiles de dotación', roles: ROLES_INVENTARIO },
    lazy: async () => {
      const { PaginaPerfiles } = await import('../pages/pagina_perfiles');
      return { Component: PaginaPerfiles };
    },
  },
  {
    path: RUTAS.perfilDotacion,
    handle: { titulo: 'Perfil de dotación', roles: ROLES_INVENTARIO },
    lazy: async () => {
      const { PaginaPerfilDotacion } = await import('../pages/pagina_perfil_dotacion');
      return { Component: PaginaPerfilDotacion };
    },
  },
  {
    path: RUTAS.verificacionesInventario,
    handle: { titulo: 'Verificaciones de inventario', roles: ROLES_INVENTARIO },
    lazy: async () => {
      const { PaginaVerificacionesInventario } = await import('../pages/pagina_verificaciones_inventario');
      return { Component: PaginaVerificacionesInventario };
    },
  },
];
