export const NOMBRES_ROLES = ['administrador', 'despachador', 'paramedico', 'conductor', 'ciudadano'] as const;

export type NombreRol = (typeof NOMBRES_ROLES)[number];

/**
 * Roles del personal. El ciudadano se registra desde la app y solo se muestra: el backend
 * rechaza crearlo o asignarlo desde la web, y convertir a un ciudadano en personal.
 */
export const ROLES_INTERNOS = ['administrador', 'despachador', 'paramedico', 'conductor'] as const satisfies readonly NombreRol[];

export type RolInterno = (typeof ROLES_INTERNOS)[number];

export function esRolInterno(rol: NombreRol): rol is RolInterno {
  return ROLES_INTERNOS.some((interno) => interno === rol);
}
