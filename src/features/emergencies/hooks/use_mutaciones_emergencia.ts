import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLAVES_EMERGENCIAS } from '../constants/emergencias';
import {
  actualizarEmergencia,
  cancelarEmergencia,
  crearEmergencia,
  marcarDuplicada,
} from '../services/emergencias.service';
import type { DatosActualizarEmergencia, Emergencia } from '../types/emergencia.types';

const ESTADOS_RECARGA = [404, 409, 422];

/** El detalle toma la respuesta confirmada; listados y sugerencias se recargan del backend. */
function useSincronizarEmergencia() {
  const clienteConsultas = useQueryClient();
  return (emergencia: Emergencia) => {
    clienteConsultas.setQueryData(CLAVES_EMERGENCIAS.detalle(emergencia.id), emergencia);
    return Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_EMERGENCIAS.listas }),
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_EMERGENCIAS.todasDuplicadas }),
    ]);
  };
}

/** Tras un conflicto se vuelve a consultar la emergencia para mostrar su estado real. */
function useRecargarEmergencia() {
  const clienteConsultas = useQueryClient();
  return (id: string) =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_EMERGENCIAS.detalle(id) }),
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_EMERGENCIAS.listas }),
    ]);
}

export function useCrearEmergencia() {
  const sincronizar = useSincronizarEmergencia();
  return useMutation({ mutationFn: crearEmergencia, onSuccess: sincronizar });
}

export function useActualizarEmergencia() {
  const sincronizar = useSincronizarEmergencia();
  const recargar = useRecargarEmergencia();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosActualizarEmergencia }) =>
      actualizarEmergencia(id, datos),
    onSuccess: sincronizar,
    onError: (error, { id }) => {
      if (error.estado !== null && ESTADOS_RECARGA.includes(error.estado)) void recargar(id);
    },
  });
}

export function useCancelarEmergencia() {
  const sincronizar = useSincronizarEmergencia();
  const recargar = useRecargarEmergencia();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => cancelarEmergencia(id, motivo),
    onSuccess: sincronizar,
    onError: (error, { id }) => {
      if (error.estado !== null && ESTADOS_RECARGA.includes(error.estado)) void recargar(id);
    },
  });
}

export function useMarcarDuplicada() {
  const sincronizar = useSincronizarEmergencia();
  const recargar = useRecargarEmergencia();
  return useMutation({
    mutationFn: ({ id, emergenciaPrincipalId }: { id: string; emergenciaPrincipalId: string }) =>
      marcarDuplicada(id, emergenciaPrincipalId),
    onSuccess: sincronizar,
    onError: (error, { id }) => {
      if (error.estado !== null && ESTADOS_RECARGA.includes(error.estado)) void recargar(id);
    },
  });
}
