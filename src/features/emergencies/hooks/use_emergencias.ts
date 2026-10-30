import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useIntervaloRespaldo } from '../../realtime/hooks/use_tiempo_real';
import { esActiva } from '../constants/catalogos_emergencia';
import { CLAVES_EMERGENCIAS } from '../constants/emergencias';
import {
  listarEmergencias,
  listarPosiblesDuplicadas,
  obtenerEmergencia,
} from '../services/emergencias.service';
import type { Emergencia, FiltrosEmergencias } from '../types/emergencia.types';

/** `intervaloMs` consulta periódicamente cuando no hay tiempo real (ver `useIntervaloRespaldo`). */
export function useEmergencias(filtros: FiltrosEmergencias, intervaloMs: number | false = false) {
  return useQuery({
    queryKey: CLAVES_EMERGENCIAS.lista(filtros),
    queryFn: () => listarEmergencias(filtros),
    placeholderData: keepPreviousData,
    refetchInterval: intervaloMs,
  });
}

/** Respaldo cuando no hay tiempo real: el estado que cambia la tripulación se consulta periódicamente. */
const INTERVALO_EN_VIVO_MS = 15_000;

/**
 * `conocida` se muestra mientras llega la versión confirmada por el backend.
 * Con `enVivo`, se vuelve a consultar solo mientras la emergencia siga activa.
 */
export function useEmergencia(id: string, conocida?: Emergencia, { enVivo = false } = {}) {
  const respaldo = useIntervaloRespaldo(INTERVALO_EN_VIVO_MS);
  return useQuery({
    queryKey: CLAVES_EMERGENCIAS.detalle(id),
    queryFn: () => obtenerEmergencia(id),
    placeholderData: conocida,
    refetchInterval: ({ state }) =>
      enVivo && state.data && esActiva(state.data.estado) ? respaldo : false,
  });
}

export function usePosiblesDuplicadas(id: string) {
  return useQuery({
    queryKey: CLAVES_EMERGENCIAS.duplicadas(id),
    queryFn: () => listarPosiblesDuplicadas(id),
  });
}
