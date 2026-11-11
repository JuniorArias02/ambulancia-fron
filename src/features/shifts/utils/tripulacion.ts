import type { Turno } from '../types/turno.types';

/**
 * Qué le falta a una tripulación incompleta: `null` si está completa. Una persona sola forma un
 * turno válido, pero la ambulancia no se puede despachar hasta tener conductor y asistencial.
 */
export function textoFaltante({ tripulacionCompleta, integrantes }: Pick<Turno, 'tripulacionCompleta' | 'integrantes'>): string | null {
  if (tripulacionCompleta) return null;
  const tieneConductor = integrantes.some(({ funcion }) => funcion === 'conductor');
  const tieneAsistencial = integrantes.some(({ funcion }) => funcion !== 'conductor');
  if (!tieneConductor && !tieneAsistencial) return 'Faltan el conductor y el paramédico o médico.';
  if (!tieneConductor) return 'Falta el conductor.';
  if (!tieneAsistencial) return 'Falta el paramédico o médico.';
  return 'La tripulación está incompleta.';
}
