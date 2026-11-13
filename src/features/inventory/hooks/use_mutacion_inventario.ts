import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLAVES_INVENTARIO } from '../constants/claves_inventario';

/**
 * Mutación del inventario: al terminar bien refresca todo el módulo, porque un mismo cambio
 * afecta existencias, dotación, alertas y listados. También refresca tras un 409 (alguien
 * cambió el dato al mismo tiempo), para mostrar el estado real.
 */
export function useMutacionInventario<Variables, Resultado>(funcion: (variables: Variables) => Promise<Resultado>) {
  const clienteConsultas = useQueryClient();
  const refrescar = () => void clienteConsultas.invalidateQueries({ queryKey: CLAVES_INVENTARIO.todo });
  return useMutation({
    mutationFn: funcion,
    onSuccess: refrescar,
    onError: (error) => {
      if (error.estado === 409) refrescar();
    },
  });
}
