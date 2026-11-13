import { ETIQUETAS_TIPO_MOVIMIENTO } from '../constants/catalogos_inventario';
import type { Movimiento } from '../types/inventario.types';

/**
 * Texto inicial de la resolución con los movimientos creados al corregir las novedades,
 * para que la constancia cite sus códigos. Queda editable.
 */
export function proponerResolucion(movimientos: readonly Pick<Movimiento, 'codigo' | 'tipo' | 'estado'>[]): string {
  if (movimientos.length === 0) return '';
  const lineas = movimientos.map(
    (movimiento) =>
      `${ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo]} ${movimiento.codigo}${movimiento.estado === 'borrador' ? ' (en borrador)' : ''}`,
  );
  return `Corregido con: ${lineas.join('; ')}.`;
}
