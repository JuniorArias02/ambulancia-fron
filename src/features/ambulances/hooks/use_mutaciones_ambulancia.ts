import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLAVES_AMBULANCIAS } from '../constants/ambulancias';
import {
  actualizarAmbulancia,
  cambiarEstadoAmbulancia,
  crearAmbulancia,
} from '../services/ambulancias.service';
import type {
  Ambulancia,
  DatosActualizarAmbulancia,
  DatosCambioEstadoAmbulancia,
} from '../types/ambulancia.types';

/** El detalle toma la respuesta confirmada; los listados se recargan desde el backend. */
function useSincronizarAmbulancia() {
  const clienteConsultas = useQueryClient();
  return (ambulancia: Ambulancia) => {
    clienteConsultas.setQueryData(CLAVES_AMBULANCIAS.detalle(ambulancia.id), ambulancia);
    return clienteConsultas.invalidateQueries({ queryKey: CLAVES_AMBULANCIAS.listas });
  };
}

/** Tras un conflicto se vuelve a consultar la ambulancia para mostrar su estado real. */
function useRecargarAmbulancia() {
  const clienteConsultas = useQueryClient();
  return (id: string) =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_AMBULANCIAS.detalle(id) }),
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_AMBULANCIAS.listas }),
    ]);
}

export function useCrearAmbulancia() {
  const sincronizar = useSincronizarAmbulancia();
  return useMutation({ mutationFn: crearAmbulancia, onSuccess: sincronizar });
}

export function useActualizarAmbulancia() {
  const sincronizar = useSincronizarAmbulancia();
  const recargar = useRecargarAmbulancia();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosActualizarAmbulancia }) =>
      actualizarAmbulancia(id, datos),
    onSuccess: sincronizar,
    onError: (error, { id }) => {
      if (error.estado === 404 || error.estado === 422) void recargar(id);
    },
  });
}

export function useCambiarEstadoAmbulancia() {
  const clienteConsultas = useQueryClient();
  const sincronizar = useSincronizarAmbulancia();
  const recargar = useRecargarAmbulancia();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosCambioEstadoAmbulancia }) =>
      cambiarEstadoAmbulancia(id, datos),
    onSuccess: (ambulancia) =>
      Promise.all([
        sincronizar(ambulancia),
        clienteConsultas.invalidateQueries({
          queryKey: CLAVES_AMBULANCIAS.historial(ambulancia.id),
        }),
      ]),
    onError: (error, { id }) => {
      if (error.estado === 404 || error.estado === 409 || error.estado === 422) void recargar(id);
    },
  });
}
