import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useIntervaloRespaldo } from '../../realtime/hooks/use_tiempo_real';
import {
  CLAVES_ASIGNACIONES,
  INTERVALO_ACTUALIZACION_MS,
  INTERVALO_RUTAS_MS,
  LIMITE_ACTIVAS,
} from '../constants/asignaciones';
import {
  listarAsignaciones,
  listarEventosAsignacion,
  listarRecorrido,
  listarRutasActivas,
  obtenerRutaAsignacion,
} from '../services/asignaciones.service';
import type { FiltrosAsignaciones } from '../types/asignacion.types';

interface OpcionesConsulta {
  /** Se mantiene al día: con tiempo real por avisos, sin él consultando cada 15 s. */
  enVivo?: boolean;
}

export function useAsignaciones(filtros: FiltrosAsignaciones, { enVivo = false }: OpcionesConsulta = {}) {
  const respaldo = useIntervaloRespaldo(INTERVALO_ACTUALIZACION_MS);
  return useQuery({
    queryKey: CLAVES_ASIGNACIONES.lista(filtros),
    queryFn: () => listarAsignaciones(filtros),
    placeholderData: keepPreviousData,
    refetchInterval: enVivo ? respaldo : false,
  });
}

/** Tablero de servicios en curso; el avance lo marca la tripulación desde la app. */
export function useAsignacionesActivas() {
  return useAsignaciones({ soloActivas: true, pagina: 1, limite: LIMITE_ACTIVAS }, { enVivo: true });
}

export function useAsignacionesDeEmergencia(emergenciaId: string, enVivo: boolean) {
  return useAsignaciones({ emergenciaId, pagina: 1, limite: LIMITE_ACTIVAS }, { enVivo });
}

/**
 * Puntos GPS reportados; con tiempo real cada posición se agrega sin volver a consultar.
 * Solo se usa cuando el servicio no tiene ruta por calles (ya llegó o terminó).
 */
export function useRecorrido(asignacionId: string, enVivo: boolean, habilitado = true) {
  const respaldo = useIntervaloRespaldo(INTERVALO_ACTUALIZACION_MS);
  return useQuery({
    queryKey: CLAVES_ASIGNACIONES.recorrido(asignacionId),
    queryFn: () => listarRecorrido(asignacionId),
    refetchInterval: enVivo ? respaldo : false,
    enabled: habilitado,
  });
}

/** Ruta por calles de un servicio que va hacia la emergencia (`asignada` o `en_camino`). */
export function useRutaAsignacion(asignacionId: string, habilitada: boolean) {
  const respaldo = useIntervaloRespaldo(INTERVALO_RUTAS_MS);
  return useQuery({
    queryKey: CLAVES_ASIGNACIONES.ruta(asignacionId),
    queryFn: () => obtenerRutaAsignacion(asignacionId),
    enabled: habilitada,
    refetchInterval: habilitada ? respaldo : false,
  });
}

/**
 * Rutas por calles de las ambulancias que van hacia una emergencia. Con tiempo real llegan por
 * `asignacion.ruta_actualizada`; sin él se consultan cada 30 s mientras la pestaña está visible.
 */
export function useRutasActivas() {
  const respaldo = useIntervaloRespaldo(INTERVALO_RUTAS_MS);
  return useQuery({
    queryKey: CLAVES_ASIGNACIONES.rutasActivas,
    queryFn: listarRutasActivas,
    refetchInterval: respaldo,
  });
}

/**
 * Bitácora de un servicio. Se recarga sola cuando llega `asignacion.actualizada` (los avisos
 * invalidan todo lo de asignaciones); sin tiempo real, cada 15 s mientras siga activo.
 */
export function useEventosAsignacion(asignacionId: string, enVivo: boolean) {
  const respaldo = useIntervaloRespaldo(INTERVALO_ACTUALIZACION_MS);
  return useQuery({
    queryKey: CLAVES_ASIGNACIONES.eventos(asignacionId),
    queryFn: () => listarEventosAsignacion(asignacionId),
    refetchInterval: enVivo ? respaldo : false,
  });
}
