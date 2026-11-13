import type { ControlInsumo, TipoMovimiento, TipoUbicacion } from '../types/inventario.types';

/** Un ajuste solo con destino aumenta la existencia; solo con origen, la disminuye. */
export type SentidoAjuste = 'aumentar' | 'disminuir';

export interface ReglaMovimiento {
  /** Tipos de ubicación admitidos como origen; `null` si el tipo no lleva origen. */
  origen: readonly TipoUbicacion[] | null;
  destino: readonly TipoUbicacion[] | null;
  motivoObligatorio: boolean;
}

const AMBAS: readonly TipoUbicacion[] = ['bodega', 'ambulancia'];

/** Qué ubicaciones pide cada tipo (guía de inventario, §7.1). */
export function reglaMovimiento(tipo: TipoMovimiento, sentido: SentidoAjuste): ReglaMovimiento {
  switch (tipo) {
    case 'entrada':
      return { origen: null, destino: ['bodega'], motivoObligatorio: false };
    case 'transferencia':
      return { origen: AMBAS, destino: AMBAS, motivoObligatorio: false };
    case 'consumo':
      return { origen: ['ambulancia'], destino: null, motivoObligatorio: false };
    case 'devolucion':
      return { origen: ['ambulancia'], destino: ['bodega'], motivoObligatorio: false };
    case 'ajuste':
      return sentido === 'aumentar'
        ? { origen: null, destino: AMBAS, motivoObligatorio: true }
        : { origen: AMBAS, destino: null, motivoObligatorio: true };
    case 'baja':
      return { origen: AMBAS, destino: null, motivoObligatorio: true };
  }
}

/** Clave de una unidad de control, para no repetirla en dos líneas. */
export function claveUnidad(linea: { insumoId: string; loteId: string; equipoId: string }): string {
  return `${linea.insumoId}|${linea.loteId}|${linea.equipoId}`;
}

/** Qué identificador exige el control del insumo en cada línea. */
export function faltaIdentificador(
  control: ControlInsumo | undefined,
  linea: { loteId: string; equipoId: string },
): 'lote' | 'serie' | null {
  if (control === 'lote' && !linea.loteId) return 'lote';
  if (control === 'serie' && !linea.equipoId) return 'serie';
  return null;
}
