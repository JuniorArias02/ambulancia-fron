import type { Emergencia, PrioridadEmergencia } from '../../emergencies/types/emergencia.types';

const ORDEN_PRIORIDAD: Record<PrioridadEmergencia, number> = { roja: 0, amarilla: 1, verde: 2 };
const SIN_PRIORIDAD = 3;

/**
 * Emergencias recibidas que esperan ambulancia: primero las más críticas y, entre iguales,
 * las que llevan más tiempo esperando. Las duplicadas no se despachan.
 */
export function pendientesDeDespacho(emergencias: Emergencia[]): Emergencia[] {
  return emergencias
    .filter(({ estado, emergenciaPrincipalId }) => estado === 'recibida' && !emergenciaPrincipalId)
    .sort((a, b) => {
      const prioridadA = a.prioridad ? ORDEN_PRIORIDAD[a.prioridad] : SIN_PRIORIDAD;
      const prioridadB = b.prioridad ? ORDEN_PRIORIDAD[b.prioridad] : SIN_PRIORIDAD;
      return prioridadA - prioridadB || a.recibidaEn.localeCompare(b.recibidaEn);
    });
}
