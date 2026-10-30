import type { Usuario } from '../../users/types/usuario.types';
import type { OpcionPersona, Turno } from '../types/turno.types';

/** Quién está en el turno activo de otra ambulancia: `usuarioId` → código de la ambulancia. */
export function personasOcupadas(turnosActivos: Turno[], turnoActualId?: string): Map<string, string> {
  const ocupadas = new Map<string, string>();
  for (const turno of turnosActivos) {
    if (turno.id === turnoActualId) continue;
    for (const { usuarioId } of turno.integrantes) {
      ocupadas.set(usuarioId, turno.ambulanciaCodigo ?? 'otra ambulancia');
    }
  }
  return ocupadas;
}

/**
 * Opciones de una fila: el personal del rol que exige la función, sin quienes ya van en otra
 * fila y marcando a quienes están en otro turno (el backend respondería `409`).
 */
export function opcionesPersona(
  personal: Usuario[],
  ocupadas: Map<string, string>,
  elegidasEnOtrasFilas: ReadonlySet<string>,
): OpcionPersona[] {
  return personal
    .filter(({ id }) => !elegidasEnOtrasFilas.has(id))
    .map(({ id, nombres, apellidos }) => {
      const ambulancia = ocupadas.get(id);
      return {
        usuarioId: id,
        nombre: `${nombres} ${apellidos}`,
        noDisponible: ambulancia ? `en el turno de ${ambulancia}` : undefined,
      };
    })
    .sort((a, b) => Number(Boolean(a.noDisponible)) - Number(Boolean(b.noDisponible)) || a.nombre.localeCompare(b.nombre, 'es'));
}
