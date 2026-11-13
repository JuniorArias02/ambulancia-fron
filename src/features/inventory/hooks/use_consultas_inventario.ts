import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CLAVES_INVENTARIO } from '../constants/claves_inventario';
import { INTERVALO_RESUMEN_MS } from '../constants/catalogos_inventario';
import { listarBodegas, listarControles, listarUbicaciones } from '../services/bodegas.service';
import {
  listarCatalogoInsumos,
  listarEquipos,
  listarInsumos,
  listarLotes,
  listarMantenimientos,
  listarRegistros,
} from '../services/catalogo.service';
import {
  listarExistencias,
  listarExistenciasDeUbicacion,
  listarMovimientos,
  obtenerAlertas,
  obtenerDotacion,
  obtenerMovimiento,
} from '../services/movimientos.service';
import { listarPerfiles, obtenerPerfil } from '../services/perfiles.service';
import { listarVerificacionesInventario, obtenerVerificacionInventario } from '../services/verificaciones.service';
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

/** Catálogos de apoyo para selectores: cambian poco. */
const VIGENCIA_CATALOGO_MS = 5 * 60_000;

export function useInsumos(filtros: FiltrosInsumos) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.insumos(filtros),
    queryFn: () => listarInsumos(filtros),
    placeholderData: keepPreviousData,
  });
}

/** Insumos activos, completos, para los selectores. */
export function useCatalogoInsumos() {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.catalogoInsumos,
    queryFn: listarCatalogoInsumos,
    staleTime: VIGENCIA_CATALOGO_MS,
  });
}

export function useRegistros(filtros: FiltrosRegistros, habilitado = true) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.registros(filtros),
    queryFn: () => listarRegistros(filtros),
    placeholderData: keepPreviousData,
    enabled: habilitado,
  });
}

export function useBodegas(filtros: FiltrosBodegas) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.bodegas(filtros),
    queryFn: () => listarBodegas(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useUbicaciones(tipo?: TipoUbicacion) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.ubicaciones(tipo),
    queryFn: () => listarUbicaciones(tipo),
    staleTime: VIGENCIA_CATALOGO_MS,
  });
}

export function useLotes(filtros: FiltrosLotes, habilitado = true) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.lotes(filtros),
    queryFn: () => listarLotes(filtros),
    placeholderData: keepPreviousData,
    enabled: habilitado,
  });
}

export function useEquipos(filtros: FiltrosEquipos, habilitado = true) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.equipos(filtros),
    queryFn: () => listarEquipos(filtros),
    placeholderData: keepPreviousData,
    enabled: habilitado,
  });
}

export function useMantenimientos(equipoId: string) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.mantenimientos(equipoId),
    queryFn: () => listarMantenimientos(equipoId),
  });
}

export function useMovimientos(filtros: FiltrosMovimientos, intervaloMs: number | false = false) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.movimientos(filtros),
    queryFn: () => listarMovimientos(filtros),
    placeholderData: keepPreviousData,
    refetchInterval: intervaloMs,
  });
}

export function useMovimiento(id: string) {
  return useQuery({ queryKey: CLAVES_INVENTARIO.movimiento(id), queryFn: () => obtenerMovimiento(id) });
}

export function useExistencias(filtros: FiltrosExistencias) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.existencias(filtros),
    queryFn: () => listarExistencias(filtros),
    placeholderData: keepPreviousData,
  });
}

/** Lo que hay en una ubicación, para elegir qué sale de ella. */
export function useExistenciasDeUbicacion(ubicacionId: string | undefined) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.existenciasUbicacion(ubicacionId ?? ''),
    queryFn: () => listarExistenciasDeUbicacion(ubicacionId ?? ''),
    enabled: Boolean(ubicacionId),
  });
}

export function useDotacion(ambulanciaId: string | undefined) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.dotacion(ambulanciaId ?? ''),
    queryFn: () => obtenerDotacion(ambulanciaId ?? ''),
    enabled: Boolean(ambulanciaId),
  });
}

/** Sin tiempo real en inventario: el tablero se refresca cada minuto. */
export function useAlertas(dias: number) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.alertas(dias),
    queryFn: () => obtenerAlertas(dias),
    placeholderData: keepPreviousData,
    refetchInterval: INTERVALO_RESUMEN_MS,
  });
}

export function usePerfiles(filtros: FiltrosPerfiles) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.perfiles(filtros),
    queryFn: () => listarPerfiles(filtros),
    placeholderData: keepPreviousData,
  });
}

export function usePerfil(id: string) {
  return useQuery({ queryKey: CLAVES_INVENTARIO.perfil(id), queryFn: () => obtenerPerfil(id) });
}

export function useControles(filtros: FiltrosControles) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.controles(filtros),
    queryFn: () => listarControles(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useVerificacionesInventario(filtros: FiltrosVerificacionesInventario, intervaloMs: number | false = false) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.verificaciones(filtros),
    queryFn: () => listarVerificacionesInventario(filtros),
    placeholderData: keepPreviousData,
    refetchInterval: intervaloMs,
  });
}

export function useVerificacionInventario(id: string) {
  return useQuery({
    queryKey: CLAVES_INVENTARIO.verificacion(id),
    queryFn: () => obtenerVerificacionInventario(id),
  });
}

/** Verificaciones con novedades sin revisar, para el contador del menú. Comparte caché con el resumen. */
export function usePendientesRevision(habilitado: boolean) {
  const filtros = { revisada: false, pagina: 1, limite: 1 };
  return useQuery({
    queryKey: CLAVES_INVENTARIO.verificaciones(filtros),
    queryFn: () => listarVerificacionesInventario(filtros),
    select: ({ total }) => total,
    enabled: habilitado,
    refetchInterval: INTERVALO_RESUMEN_MS,
  });
}
