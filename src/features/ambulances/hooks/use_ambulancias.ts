import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useIntervaloRespaldo } from '../../realtime/hooks/use_tiempo_real';
import { CLAVES_AMBULANCIAS, LIMITE_HISTORIAL } from '../constants/ambulancias';
import {
  listarAmbulancias,
  listarFlota,
  listarHistorialEstados,
  obtenerAmbulancia,
} from '../services/ambulancias.service';
import type { Ambulancia, FiltrosAmbulancias } from '../types/ambulancia.types';

/** `intervaloMs` consulta periódicamente cuando no hay tiempo real (ver `useIntervaloRespaldo`). */
export function useAmbulancias(filtros: FiltrosAmbulancias, intervaloMs: number | false = false) {
  return useQuery({
    queryKey: CLAVES_AMBULANCIAS.lista(filtros),
    queryFn: () => listarAmbulancias(filtros),
    placeholderData: keepPreviousData,
    refetchInterval: intervaloMs,
  });
}

/**
 * Toda la flota para el mapa. Con tiempo real la mantienen los avisos; sin él se consulta cada
 * `intervaloMs`, y React Query pausa la consulta mientras la pestaña no está visible.
 */
export function useFlota(intervaloMs: number | false = false) {
  return useQuery({
    queryKey: CLAVES_AMBULANCIAS.flota,
    queryFn: listarFlota,
    refetchInterval: intervaloMs,
  });
}

/** Respaldo sin tiempo real para seguir la posición de una ambulancia en servicio. */
const INTERVALO_EN_VIVO_MS = 15_000;

/**
 * `conocida` se muestra mientras llega la versión confirmada por el backend.
 * Con `enVivo`, la posición la actualizan los avisos GPS o, sin tiempo real, una consulta cada 15 s.
 */
export function useAmbulancia(id: string, conocida?: Ambulancia, { enVivo = false } = {}) {
  const respaldo = useIntervaloRespaldo(INTERVALO_EN_VIVO_MS);
  return useQuery({
    queryKey: CLAVES_AMBULANCIAS.detalle(id),
    queryFn: () => obtenerAmbulancia(id),
    placeholderData: conocida,
    refetchInterval: enVivo ? respaldo : false,
  });
}

/** Historial del más reciente al más antiguo, cargado por páginas. */
export function useHistorialEstados(id: string) {
  return useInfiniteQuery({
    queryKey: CLAVES_AMBULANCIAS.historial(id),
    queryFn: ({ pageParam }) => listarHistorialEstados(id, pageParam, LIMITE_HISTORIAL),
    initialPageParam: 1,
    getNextPageParam: ({ pagina, limite, total }) =>
      pagina * limite < total ? pagina + 1 : undefined,
  });
}
