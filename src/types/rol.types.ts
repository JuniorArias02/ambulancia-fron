export const NOMBRES_ROLES = ['administrador', 'despachador', 'paramedico', 'conductor'] as const;

export type NombreRol = (typeof NOMBRES_ROLES)[number];
