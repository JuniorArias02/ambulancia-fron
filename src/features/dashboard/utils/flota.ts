import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { esAsignacionActiva } from '../../assignments/constants/asignaciones';
import type { Asignacion } from '../../assignments/types/asignacion.types';

/**
 * `disponibles`: se pueden despachar ya. `en_servicio`: tienen una emergencia.
 * `otras`: fuera de servicio o en mantenimiento.
 */
export type FiltroFlota = 'todas' | 'disponibles' | 'en_servicio' | 'otras';

export const FILTROS_FLOTA: readonly FiltroFlota[] = ['todas', 'disponibles', 'en_servicio', 'otras'];

export const ETIQUETAS_FILTRO_FLOTA: Record<FiltroFlota, string> = {
  todas: 'Todas',
  disponibles: 'Disponibles',
  en_servicio: 'En servicio',
  otras: 'Fuera de servicio / mantenimiento',
};

export function cumpleFiltro({ estadoOperativo }: Ambulancia, filtro: FiltroFlota): boolean {
  switch (filtro) {
    case 'todas':
      return true;
    case 'disponibles':
      return estadoOperativo === 'disponible';
    case 'en_servicio':
      return estadoOperativo === 'en_servicio';
    case 'otras':
      return estadoOperativo === 'fuera_servicio' || estadoOperativo === 'mantenimiento';
  }
}

/** Se cuenta en el navegador con la flota completa: los contadores siempre cuadran. */
export function contarPorFiltro(ambulancias: Ambulancia[]): Record<FiltroFlota, number> {
  return {
    todas: ambulancias.length,
    disponibles: ambulancias.filter((ambulancia) => cumpleFiltro(ambulancia, 'disponibles')).length,
    en_servicio: ambulancias.filter((ambulancia) => cumpleFiltro(ambulancia, 'en_servicio')).length,
    otras: ambulancias.filter((ambulancia) => cumpleFiltro(ambulancia, 'otras')).length,
  };
}

/** Servicio activo de cada ambulancia, para mostrar a qué emergencia va. */
export function asignacionesPorAmbulancia(asignaciones: Asignacion[]): Map<string, Asignacion> {
  const porAmbulancia = new Map<string, Asignacion>();
  for (const asignacion of asignaciones) {
    if (esAsignacionActiva(asignacion.estado)) porAmbulancia.set(asignacion.ambulanciaId, asignacion);
  }
  return porAmbulancia;
}

/**
 * Etapa de una emergencia según sus servicios activos (puede tener varios si hay varias víctimas):
 * - `en_lugar`: alguna ambulancia ya llegó o está atendiendo.
 * - `paciente_recogido`: todas sus ambulancias van con el paciente a bordo; ya no hay nadie en el sitio.
 * El estado de la emergencia no cambia al recoger al paciente: la etapa fina la dan los servicios.
 */
export type EtapaEmergencia = 'sin_servicio' | 'en_camino' | 'en_lugar' | 'paciente_recogido';

export function pacienteRecogido(asignacionesActivas: Asignacion[]): boolean {
  return asignacionesActivas.length > 0 && asignacionesActivas.every(({ estado }) => estado === 'trasladando');
}

export function etapaEmergencia(asignaciones: Asignacion[]): EtapaEmergencia {
  const activas = asignaciones.filter(({ estado }) => esAsignacionActiva(estado));
  if (activas.length === 0) return 'sin_servicio';
  if (pacienteRecogido(activas)) return 'paciente_recogido';
  if (activas.some(({ estado }) => estado === 'en_escena' || estado === 'atendiendo')) return 'en_lugar';
  return 'en_camino';
}

/** Etapa de cada emergencia que tiene servicios activos. */
export function etapasPorEmergencia(asignaciones: Asignacion[]): Map<string, EtapaEmergencia> {
  const porEmergencia = new Map<string, Asignacion[]>();
  for (const asignacion of asignaciones) {
    porEmergencia.set(asignacion.emergenciaId, [...(porEmergencia.get(asignacion.emergenciaId) ?? []), asignacion]);
  }
  return new Map([...porEmergencia].map(([emergenciaId, propias]) => [emergenciaId, etapaEmergencia(propias)]));
}
