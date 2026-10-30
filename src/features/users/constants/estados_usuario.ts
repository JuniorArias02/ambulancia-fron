import type { EstadoUsuario } from '../types/usuario.types';

export const ESTADOS_USUARIO = ['activo', 'inactivo', 'bloqueado'] as const satisfies readonly EstadoUsuario[];

export const ETIQUETAS_ESTADO: Record<EstadoUsuario, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  bloqueado: 'Bloqueado',
};

/** Verbo de la acción que lleva al usuario a cada estado. */
export const ACCIONES_ESTADO: Record<EstadoUsuario, string> = {
  activo: 'Activar',
  inactivo: 'Inactivar',
  bloqueado: 'Bloquear',
};
