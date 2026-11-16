import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLAVES_USUARIOS } from '../constants/usuarios';
import { desactivarFirma, listarFirmasUsuario } from '../services/firmas.service';

export function useFirmasUsuario(usuarioId: string) {
  return useQuery({
    queryKey: CLAVES_USUARIOS.firmas(usuarioId),
    queryFn: () => listarFirmasUsuario(usuarioId),
  });
}

/** Se recarga el historial al terminar y también con 409 o 422: la firma cambió mientras tanto. */
export function useDesactivarFirma(usuarioId: string) {
  const clienteConsultas = useQueryClient();
  const refrescar = () => clienteConsultas.invalidateQueries({ queryKey: CLAVES_USUARIOS.firmas(usuarioId) });
  return useMutation({
    mutationFn: ({ firmaId, motivo }: { firmaId: string; motivo: string }) =>
      desactivarFirma(usuarioId, firmaId, motivo),
    onSuccess: refrescar,
    onError: (error) => {
      if (error.estado === 409 || error.estado === 422) void refrescar();
    },
  });
}
