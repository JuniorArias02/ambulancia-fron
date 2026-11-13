import type { OpcionBuscable } from '../../../utils/opciones_buscables';
import { ETIQUETAS_TIPO_UBICACION } from '../constants/catalogos_inventario';
import type { Insumo, UbicacionInventario } from '../types/inventario.types';

/** Se busca por nombre, código o unidad. */
export function opcionesInsumos(insumos: readonly Insumo[]): OpcionBuscable[] {
  return insumos.map((insumo) => ({
    valor: insumo.id,
    texto: insumo.nombre,
    detalle: `${insumo.codigo} · ${insumo.unidadMedida}`,
  }));
}

/** Se busca por nombre de bodega, código de ambulancia o tipo. */
export function opcionesUbicaciones(ubicaciones: readonly UbicacionInventario[]): OpcionBuscable[] {
  return [...ubicaciones]
    .sort((a, b) => a.tipo.localeCompare(b.tipo) || (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es', { numeric: true }))
    .map((ubicacion) => ({
      valor: ubicacion.id,
      texto: ubicacion.nombre ?? 'Sin nombre',
      detalle: ETIQUETAS_TIPO_UBICACION[ubicacion.tipo],
    }));
}
