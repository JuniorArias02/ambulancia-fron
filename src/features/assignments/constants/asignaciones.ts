import {
  BedSingle,
  BellRing,
  CircleCheck,
  CircleSlash,
  MapPinCheck,
  Navigation,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import type { EstadoAsignacion, EstadoAvance, FiltrosAsignaciones } from '../types/asignacion.types';

export const ETIQUETAS_ESTADO_ASIGNACION: Record<EstadoAsignacion, string> = {
  asignada: 'Asignada',
  en_camino: 'En camino',
  en_escena: 'En la escena',
  atendiendo: 'Atendiendo al paciente',
  trasladando: 'Paciente a bordo',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

/** Texto del botón que marca cada avance. La finalización depende de si hubo traslado. */
export const ACCIONES_AVANCE: Record<EstadoAvance, string> = {
  en_camino: 'Salió hacia la escena',
  en_escena: 'Llegó a la escena',
  atendiendo: 'Inicia la atención',
  trasladando: 'Paciente a bordo',
  finalizada: 'Finalizar servicio',
};

/**
 * La llegada a la escena solo la marca el conductor desde la app, con su GPS: el backend
 * responde `403` si la intenta la central, así que no se ofrece ese botón.
 */
export const AVANCES_SOLO_TRIPULACION: readonly EstadoAvance[] = ['en_escena'];

/** Cerrar el servicio sin traslado exige explicar por qué. */
export const ESTADOS_CIERRE_CON_OBSERVACION: readonly EstadoAsignacion[] = ['en_escena', 'atendiendo'];

/** Cómo se lee cada paso en la bitácora del servicio. */
export const ETIQUETAS_EVENTO: Record<EstadoAsignacion, string> = {
  asignada: 'Despachada',
  en_camino: 'En camino',
  en_escena: 'Llegó a la escena',
  atendiendo: 'Atendiendo al paciente',
  trasladando: 'Paciente a bordo',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

/** Una vez en la escena ya no se cancela: se finaliza. */
export const ESTADOS_CANCELABLES: readonly EstadoAsignacion[] = ['asignada', 'en_camino'];

export const ESTADOS_ACTIVOS_ASIGNACION: readonly EstadoAsignacion[] = [
  'asignada',
  'en_camino',
  'en_escena',
  'atendiendo',
  'trasladando',
];

export const ESTILOS_ESTADO_ASIGNACION: Record<EstadoAsignacion, { icono: LucideIcon; clases: string }> = {
  asignada: { icono: BellRing, clases: 'bg-advertencia/12 text-advertencia-hover' },
  en_camino: { icono: Navigation, clases: 'bg-primario/10 text-primario' },
  en_escena: { icono: MapPinCheck, clases: 'bg-institucional/8 text-institucional' },
  atendiendo: { icono: Stethoscope, clases: 'bg-institucional/8 text-institucional' },
  trasladando: { icono: BedSingle, clases: 'bg-cian/12 text-cian-texto' },
  finalizada: { icono: CircleCheck, clases: 'bg-exito/10 text-exito' },
  cancelada: { icono: CircleSlash, clases: 'bg-texto-secundario/10 text-texto-secundario' },
};

/** Frecuencia de consulta mientras no exista WebSocket (la guía sugiere 10–15 s). */
export const INTERVALO_ACTUALIZACION_MS = 15_000;

export const LIMITE_ACTIVAS = 100;

export const CLAVES_ASIGNACIONES = {
  todas: ['asignaciones'] as const,
  lista: (filtros: FiltrosAsignaciones) => ['asignaciones', 'lista', filtros] as const,
  recorrido: (asignacionId: string) => ['asignaciones', 'recorrido', asignacionId] as const,
  /** Bajo `todas`: un cambio en un servicio también recarga las rutas. */
  rutasActivas: ['asignaciones', 'rutas', 'activas'] as const,
  ruta: (asignacionId: string) => ['asignaciones', 'rutas', asignacionId] as const,
  eventos: (asignacionId: string) => ['asignaciones', 'eventos', asignacionId] as const,
};

/** Las rutas cambian poco: sin tiempo real basta consultarlas cada 30 s. */
export const INTERVALO_RUTAS_MS = 30_000;

/** La ruta hacia la emergencia solo existe mientras la ambulancia no ha llegado. */
export const ESTADOS_CON_RUTA: readonly EstadoAsignacion[] = ['asignada', 'en_camino'];

export function esCancelable(estado: EstadoAsignacion): boolean {
  return ESTADOS_CANCELABLES.includes(estado);
}

export function esAsignacionActiva(estado: EstadoAsignacion): boolean {
  return ESTADOS_ACTIVOS_ASIGNACION.includes(estado);
}
