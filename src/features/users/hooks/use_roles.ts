import { useQuery } from '@tanstack/react-query';
import { CLAVES_USUARIOS } from '../constants/usuarios';
import { listarRoles } from '../services/roles.service';

export function useRoles() {
  return useQuery({
    queryKey: CLAVES_USUARIOS.roles,
    queryFn: listarRoles,
    // Los roles del sistema son fijos.
    staleTime: Infinity,
  });
}
