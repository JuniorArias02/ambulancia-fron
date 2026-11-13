import type { BorradorMovimiento } from '../schemas/movimiento.schema';
import type { Conteo, VerificacionInventario } from '../types/inventario.types';

export type AccionNovedad = 'disminuir' | 'aumentar' | 'reponer' | 'baja' | 'devolver';

export interface PropuestaNovedad {
  accion: AccionNovedad;
  etiqueta: string;
  borrador: BorradorMovimiento;
}

/** Hasta 3 decimales, sin errores de coma flotante al restar. */
const diferencia = (a: number, b: number) => Math.round((a - b) * 1000) / 1000;

/**
 * La verificación no cambia existencias: la bodega decide. Faltante → ajuste que disminuye o
 * reposición; sobrante → ajuste que aumenta; vencido o dañado → baja o devolución a una bodega.
 */
export function propuestasNovedad(verificacion: VerificacionInventario, conteo: Conteo): PropuestaNovedad[] {
  const ubicacion = verificacion.ubicacionId;
  const unidad = { insumoId: conteo.insumoId, loteId: conteo.loteId, equipoId: conteo.equipoId };
  const motivo = (texto: string) => `${texto} en verificación de ${verificacion.ubicacionNombre ?? 'inventario'}`.slice(0, 150);

  switch (conteo.estado) {
    case 'faltante': {
      const falta = diferencia(conteo.cantidadEsperada, conteo.cantidadEncontrada);
      if (falta <= 0) return [];
      return [
        {
          accion: 'disminuir',
          etiqueta: 'Ajustar',
          borrador: { tipo: 'ajuste', sentidoAjuste: 'disminuir', origenUbicacionId: ubicacion, motivo: motivo('Faltante'), lineas: [{ ...unidad, cantidad: falta }] },
        },
        {
          accion: 'reponer',
          etiqueta: 'Reponer',
          // Se repone el insumo; el lote o la unidad los elige la bodega de origen.
          borrador: { tipo: 'transferencia', destinoUbicacionId: ubicacion, lineas: [{ insumoId: conteo.insumoId, cantidad: falta }] },
        },
      ];
    }
    case 'sobrante': {
      const sobra = diferencia(conteo.cantidadEncontrada, conteo.cantidadEsperada);
      if (sobra <= 0) return [];
      return [
        {
          accion: 'aumentar',
          etiqueta: 'Ajustar',
          borrador: { tipo: 'ajuste', sentidoAjuste: 'aumentar', destinoUbicacionId: ubicacion, motivo: motivo('Sobrante'), lineas: [{ ...unidad, cantidad: sobra }] },
        },
      ];
    }
    case 'vencido':
    case 'danado': {
      if (conteo.cantidadEncontrada <= 0) return [];
      const lineas = [{ ...unidad, cantidad: conteo.cantidadEncontrada }];
      return [
        {
          accion: 'baja',
          etiqueta: 'Dar de baja',
          borrador: {
            tipo: 'baja',
            origenUbicacionId: ubicacion,
            motivo: motivo(conteo.estado === 'vencido' ? 'Vencido' : 'Dañado'),
            lineas,
          },
        },
        {
          accion: 'devolver',
          etiqueta: 'Devolver a bodega',
          // La bodega de destino la elige quien registra la devolución.
          borrador: { tipo: 'devolucion', origenUbicacionId: ubicacion, motivo: motivo(conteo.estado === 'vencido' ? 'Vencido' : 'Dañado'), lineas },
        },
      ];
    }
    case 'conforme':
      return [];
  }
}
