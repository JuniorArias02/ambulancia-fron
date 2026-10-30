import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLAVES_INSTITUCIONES } from '../constants/instituciones';
import {
  actualizarInstitucion,
  cambiarEstadoInstitucion,
  crearInstitucion,
  listarInstituciones,
} from '../services/instituciones.service';
import type { DatosActualizarInstitucion, FiltrosInstituciones } from '../types/institucion.types';

export function useInstituciones(filtros: FiltrosInstituciones) {
  return useQuery({
    queryKey: CLAVES_INSTITUCIONES.lista(filtros),
    queryFn: () => listarInstituciones(filtros),
    placeholderData: keepPreviousData,
  });
}

/** Tras cada mutación confirmada se recargan los listados desde el backend. */
function useInvalidarInstituciones() {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: CLAVES_INSTITUCIONES.todas });
}

export function useCrearInstitucion() {
  const invalidar = useInvalidarInstituciones();
  return useMutation({ mutationFn: crearInstitucion, onSuccess: invalidar });
}

export function useActualizarInstitucion() {
  const invalidar = useInvalidarInstituciones();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosActualizarInstitucion }) => actualizarInstitucion(id, datos),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoInstitucion() {
  const invalidar = useInvalidarInstituciones();
  return useMutation({
    mutationFn: ({ id, activa }: { id: string; activa: boolean }) => cambiarEstadoInstitucion(id, activa),
    onSuccess: invalidar,
    onError: (error) => {
      if (error.estado === 422) void invalidar();
    },
  });
}
