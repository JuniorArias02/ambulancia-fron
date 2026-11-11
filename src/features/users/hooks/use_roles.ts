import { useQuery } from '@tanstack/react-query';
import { esRolInterno } from '../../../types/rol.types';
import { CLAVES_USUARIOS } from '../constants/usuarios';
import { listarRoles } from '../services/roles.service';
import type { RolAsignable, RolSistema } from '../types/usuario.types';

function esAsignable(rol: RolSistema): rol is RolAsignable {
  return esRolInterno(rol.nombre);
}

/** Roles que se pueden asignar desde la web: el backend rechaza el de ciudadano. */
export function useRoles() {
  return useQuery({
    queryKey: CLAVES_USUARIOS.roles,
    queryFn: listarRoles,
    // Los roles del sistema son fijos.
    staleTime: Infinity,
    select: (roles) => roles.filter(esAsignable),
  });
}
