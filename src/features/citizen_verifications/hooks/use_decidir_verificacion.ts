import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLAVES_VERIFICACIONES } from '../constants/verificaciones';
import { decidirVerificacion } from '../services/verificaciones.service';
import type { DatosDecision } from '../types/verificacion.types';

export function useDecidirVerificacion(usuarioId: string) {
  const clienteConsultas = useQueryClient();
  const actualizarFila = () => {
    void clienteConsultas.invalidateQueries({ queryKey: CLAVES_VERIFICACIONES.listas });
    void clienteConsultas.invalidateQueries({ queryKey: CLAVES_VERIFICACIONES.pendientes });
  };

  return useMutation({
    mutationFn: (datos: DatosDecision) => decidirVerificacion(usuarioId, datos),
    onSuccess: (detalle) => {
      // La respuesta ya es el detalle actualizado: no hace falta volver a pedirlo.
      clienteConsultas.setQueryData(CLAVES_VERIFICACIONES.detalle(usuarioId), detalle);
      actualizarFila();
    },
    onError: (error) => {
      // Otro administrador decidió antes: se recarga para mostrar su decisión.
      if (error.estado === 409) {
        void clienteConsultas.invalidateQueries({ queryKey: CLAVES_VERIFICACIONES.detalle(usuarioId) });
        actualizarFila();
      }
    },
  });
}
