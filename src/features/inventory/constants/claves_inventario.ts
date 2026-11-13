import type {
  FiltrosBodegas,
  FiltrosControles,
  FiltrosEquipos,
  FiltrosExistencias,
  FiltrosInsumos,
  FiltrosLotes,
  FiltrosMovimientos,
  FiltrosPerfiles,
  FiltrosRegistros,
  FiltrosVerificacionesInventario,
  TipoUbicacion,
} from '../types/inventario.types';

/**
 * Todo cuelga de `['inventario']`: un movimiento cambia existencias, dotación y alertas a la vez,
 * así que tras cada mutación se invalida el módulo completo.
 */
export const CLAVES_INVENTARIO = {
  todo: ['inventario'] as const,
  insumos: (filtros: FiltrosInsumos) => ['inventario', 'insumos', filtros] as const,
  catalogoInsumos: ['inventario', 'insumos', 'catalogo'] as const,
  insumo: (id: string) => ['inventario', 'insumo', id] as const,
  registros: (filtros: FiltrosRegistros) => ['inventario', 'registros', filtros] as const,
  bodegas: (filtros: FiltrosBodegas) => ['inventario', 'bodegas', filtros] as const,
  ubicaciones: (tipo?: TipoUbicacion) => ['inventario', 'ubicaciones', tipo ?? 'todas'] as const,
  lotes: (filtros: FiltrosLotes) => ['inventario', 'lotes', filtros] as const,
  equipos: (filtros: FiltrosEquipos) => ['inventario', 'equipos', filtros] as const,
  mantenimientos: (equipoId: string) => ['inventario', 'mantenimientos', equipoId] as const,
  movimientos: (filtros: FiltrosMovimientos) => ['inventario', 'movimientos', filtros] as const,
  movimiento: (id: string) => ['inventario', 'movimiento', id] as const,
  existencias: (filtros: FiltrosExistencias) => ['inventario', 'existencias', filtros] as const,
  existenciasUbicacion: (ubicacionId: string) => ['inventario', 'existencias', 'ubicacion', ubicacionId] as const,
  dotacion: (ambulanciaId: string) => ['inventario', 'dotacion', ambulanciaId] as const,
  alertas: (dias: number) => ['inventario', 'alertas', dias] as const,
  perfiles: (filtros: FiltrosPerfiles) => ['inventario', 'perfiles', filtros] as const,
  perfil: (id: string) => ['inventario', 'perfil', id] as const,
  controles: (filtros: FiltrosControles) => ['inventario', 'controles', filtros] as const,
  verificaciones: (filtros: FiltrosVerificacionesInventario) => ['inventario', 'verificaciones', filtros] as const,
  verificacion: (id: string) => ['inventario', 'verificacion', id] as const,
};
