import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ErrorApi } from '../../../services/error_api';
import { CLAVES_AMBULANCIAS } from '../../ambulances/constants/ambulancias';
import { CLAVES_EMERGENCIAS } from '../../emergencies/constants/emergencias';
import { CLAVES_TURNOS } from '../../shifts/constants/turnos';
import { CLAVES_ASIGNACIONES } from '../constants/asignaciones';
import { cancelarAsignacion, despachar, marcarAvance } from '../services/asignaciones.service';
import type { EstadoAvance } from '../types/asignacion.types';

/**
 * Cada acción hace que el backend cambie solo los estados de la ambulancia y de la emergencia;
 * se recargan todos los datos afectados para mostrar lo que el backend confirmó.
 */
function useRecargarDespacho() {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all(
      [CLAVES_ASIGNACIONES.todas, CLAVES_AMBULANCIAS.todas, CLAVES_EMERGENCIAS.todas, CLAVES_TURNOS.todos].map(
        (queryKey) => clienteConsultas.invalidateQueries({ queryKey }),
      ),
    );
}

/** Ante un conflicto también se recarga: otro despachador pudo cambiar los datos. */
const ESTADOS_RECARGA = [404, 409, 422];

function recargarSiConflicto(recargar: () => Promise<unknown>) {
  return (error: ErrorApi) => {
    if (error.estado !== null && ESTADOS_RECARGA.includes(error.estado)) void recargar();
  };
}

export function useDespachar() {
  const recargar = useRecargarDespacho();
  return useMutation({
    mutationFn: ({ emergenciaId, ambulanciaId }: { emergenciaId: string; ambulanciaId: string }) =>
      despachar(emergenciaId, ambulanciaId),
    onSuccess: recargar,
    onError: recargarSiConflicto(recargar),
  });
}

export function useMarcarAvance() {
  const recargar = useRecargarDespacho();
  return useMutation({
    mutationFn: ({ id, estado, observacion }: { id: string; estado: EstadoAvance; observacion?: string }) =>
      marcarAvance(id, estado, observacion),
    onSuccess: recargar,
    onError: recargarSiConflicto(recargar),
  });
}

export function useCancelarAsignacion() {
  const recargar = useRecargarDespacho();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => cancelarAsignacion(id, motivo),
    onSuccess: recargar,
    onError: recargarSiConflicto(recargar),
  });
}
