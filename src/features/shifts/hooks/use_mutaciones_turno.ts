import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLAVES_AMBULANCIAS } from '../../ambulances/constants/ambulancias';
import { CLAVES_TURNOS } from '../constants/turnos';
import { cambiarIntegrantes, finalizarTurno, iniciarTurno } from '../services/turnos.service';
import type { DatosIntegrante } from '../types/turno.types';

/** Un turno cambia lo que se puede hacer con su ambulancia: se recargan ambos. */
function useInvalidarTurnos() {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_TURNOS.todos }),
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_AMBULANCIAS.todas }),
    ]);
}

export function useIniciarTurno() {
  const invalidar = useInvalidarTurnos();
  return useMutation({ mutationFn: iniciarTurno, onSuccess: invalidar });
}

export function useCambiarIntegrantes() {
  const invalidar = useInvalidarTurnos();
  return useMutation({
    mutationFn: ({ id, integrantes }: { id: string; integrantes: DatosIntegrante[] }) =>
      cambiarIntegrantes(id, integrantes),
    onSuccess: invalidar,
    onError: (error) => {
      if (error.estado === 409 || error.estado === 422) void invalidar();
    },
  });
}

export function useFinalizarTurno() {
  const invalidar = useInvalidarTurnos();
  return useMutation({
    mutationFn: finalizarTurno,
    onSuccess: invalidar,
    onError: (error) => {
      if (error.estado === 422) void invalidar();
    },
  });
}
