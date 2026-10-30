import { useQuery } from '@tanstack/react-query';
import { CLAVES_AMBULANCIAS } from '../constants/ambulancias';
import { listarTiposAmbulancia } from '../services/tipos_ambulancia.service';

export function useTiposAmbulancia() {
  return useQuery({
    queryKey: CLAVES_AMBULANCIAS.tipos,
    queryFn: listarTiposAmbulancia,
    // Es un catálogo fijo; se recarga a mano si el backend dice que un tipo ya no existe.
    staleTime: Infinity,
  });
}
