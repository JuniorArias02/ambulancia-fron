import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CLAVES_VERIFICACIONES, INTERVALO_CONTADOR_MS } from '../constants/verificaciones';
import { listarVerificaciones, obtenerVerificacion } from '../services/verificaciones.service';
import type { FiltrosVerificaciones } from '../types/verificacion.types';

export function useVerificaciones(filtros: FiltrosVerificaciones) {
  return useQuery({
    queryKey: CLAVES_VERIFICACIONES.lista(filtros),
    queryFn: () => listarVerificaciones(filtros),
    placeholderData: keepPreviousData,
  });
}

/**
 * Cada apertura queda auditada: se pide una vez al abrir la solicitud, sin recargas automáticas,
 * y se descarta de la caché al salir para no retener datos personales.
 */
export function useVerificacion(usuarioId: string) {
  return useQuery({
    queryKey: CLAVES_VERIFICACIONES.detalle(usuarioId),
    queryFn: () => obtenerVerificacion(usuarioId),
    staleTime: Infinity,
    gcTime: 0,
  });
}

/** Total de solicitudes pendientes, para el contador del menú. */
export function usePendientesVerificacion(habilitado: boolean) {
  return useQuery({
    queryKey: CLAVES_VERIFICACIONES.pendientes,
    queryFn: () => listarVerificaciones({ estado: 'pendiente', pagina: 1, limite: 1 }),
    select: ({ total }) => total,
    enabled: habilitado,
    refetchInterval: INTERVALO_CONTADOR_MS,
  });
}
