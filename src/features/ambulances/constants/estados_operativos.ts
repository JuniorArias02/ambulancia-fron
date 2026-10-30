import type { EstadoManual, EstadoOperativo } from '../types/ambulancia.types';

export const ESTADOS_OPERATIVOS = [
  'disponible',
  'en_servicio',
  'fuera_servicio',
  'mantenimiento',
] as const satisfies readonly EstadoOperativo[];

export const ESTADOS_MANUALES = [
  'disponible',
  'fuera_servicio',
  'mantenimiento',
] as const satisfies readonly EstadoManual[];

export const ETIQUETAS_ESTADO_OPERATIVO: Record<EstadoOperativo, string> = {
  disponible: 'Disponible',
  en_servicio: 'En servicio',
  fuera_servicio: 'Fuera de servicio',
  mantenimiento: 'En mantenimiento',
};

/** Estados a los que se puede pasar a mano desde cada estado; el backend valida igual. */
export const TRANSICIONES: Record<EstadoOperativo, readonly EstadoManual[]> = {
  disponible: ['fuera_servicio', 'mantenimiento'],
  fuera_servicio: ['disponible', 'mantenimiento'],
  mantenimiento: ['disponible', 'fuera_servicio'],
  en_servicio: [],
};
