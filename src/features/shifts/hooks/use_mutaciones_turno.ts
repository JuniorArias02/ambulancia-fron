import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLAVES_AMBULANCIAS } from '../../ambulances/constants/ambulancias';
import { CLAVES_TURNOS } from '../constants/turnos';
import { finalizarTurno } from '../services/turnos.service';

/** Un turno cambia lo que se puede hacer con su ambulancia: se recargan ambos. */
function useInvalidarTurnos() {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_TURNOS.todos }),
      clienteConsultas.invalidateQueries({ queryKey: CLAVES_AMBULANCIAS.todas }),
    ]);
}

export function useFinalizarTurno() {
  const invalidar = useInvalidarTurnos();
  return useMutation({
    mutationFn: finalizarTurno,
    onSuccess: invalidar,
    onError: (error) => {
      // `409`: otro lo cerró antes. `422`: en servicio o ya finalizado. Se muestra lo vigente.
      if (error.estado === 409 || error.estado === 422) void invalidar();
    },
  });
}
