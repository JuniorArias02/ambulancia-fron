import { useQuery } from '@tanstack/react-query';
import { CLAVE_PERFIL } from '../constants/claves_consulta';
import { obtenerPerfil } from '../services/perfil.service';

/**
 * Comparte la caché con la sesión, pero vuelve a consultar al abrir la vista
 * para mostrar los datos vigentes del backend.
 */
export function usePerfil() {
  return useQuery({
    queryKey: CLAVE_PERFIL,
    queryFn: obtenerPerfil,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
