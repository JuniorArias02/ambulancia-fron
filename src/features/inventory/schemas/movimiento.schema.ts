import { z } from 'zod';
import { MAXIMO_LINEAS, TIPOS_MOVIMIENTO } from '../constants/catalogos_inventario';
import type { ControlInsumo } from '../types/inventario.types';
import { claveUnidad, faltaIdentificador, reglaMovimiento } from '../utils/reglas_movimiento';
import { cantidad, textoOpcional } from './comunes.schema';

const linea = z.object({
  insumoId: z.string(),
  loteId: z.string(),
  equipoId: z.string(),
  cantidad: cantidad({ minimo: 0.001 }),
});

/**
 * `controlDe` informa cómo se controla cada insumo (catálogo), para exigir el lote o la serie
 * y que los equipos se muevan de a 1. `ahora` limita `realizadoEn`, que no puede ser futuro.
 */
export function esquemaMovimiento(controlDe: (insumoId: string) => ControlInsumo | undefined, ahora: () => Date) {
  return z
    .object({
      tipo: z.enum(TIPOS_MOVIMIENTO),
      sentidoAjuste: z.enum(['aumentar', 'disminuir']),
      origenUbicacionId: z.string(),
      destinoUbicacionId: z.string(),
      motivo: textoOpcional(150),
      documentoReferencia: textoOpcional(150),
      observaciones: textoOpcional(5000),
      /** `datetime-local`; vacío es ahora. */
      realizadoEn: z.string(),
      lineas: z.array(linea).min(1, 'Agrega al menos una línea.').max(MAXIMO_LINEAS, `Máximo ${MAXIMO_LINEAS} líneas.`),
    })
    .superRefine((datos, contexto) => {
      const regla = reglaMovimiento(datos.tipo, datos.sentidoAjuste);
      const problema = (ruta: (string | number)[], message: string) => contexto.addIssue({ code: 'custom', path: ruta, message });

      if (regla.origen && !datos.origenUbicacionId) problema(['origenUbicacionId'], 'Elige el origen.');
      if (regla.destino && !datos.destinoUbicacionId) problema(['destinoUbicacionId'], 'Elige el destino.');
      if (regla.origen && regla.destino && datos.origenUbicacionId && datos.origenUbicacionId === datos.destinoUbicacionId) {
        problema(['destinoUbicacionId'], 'El destino debe ser distinto del origen.');
      }
      if (regla.motivoObligatorio && !datos.motivo) problema(['motivo'], 'Este tipo de movimiento exige un motivo.');
      if (datos.realizadoEn && new Date(datos.realizadoEn) > ahora()) problema(['realizadoEn'], 'No puede ser una fecha futura.');

      const vistas = new Set<string>();
      datos.lineas.forEach((fila, indice) => {
        if (!fila.insumoId) {
          problema(['lineas', indice, 'insumoId'], 'Elige qué se mueve.');
          return;
        }
        const control = controlDe(fila.insumoId);
        const falta = faltaIdentificador(control, fila);
        if (falta) problema(['lineas', indice, falta === 'lote' ? 'loteId' : 'equipoId'], falta === 'lote' ? 'Elige el lote.' : 'Elige el equipo.');
        if (control === 'serie' && fila.cantidad !== 1) problema(['lineas', indice, 'cantidad'], 'Los equipos se mueven de a 1.');
        const clave = claveUnidad(fila);
        if (vistas.has(clave)) problema(['lineas', indice, 'insumoId'], 'Esta unidad ya está en otra línea.');
        vistas.add(clave);
      });
    });
}

export type EntradaMovimiento = z.input<ReturnType<typeof esquemaMovimiento>>;
export type FormularioMovimiento = z.output<ReturnType<typeof esquemaMovimiento>>;

/** Valores iniciales que otras pantallas pueden proponer (abastecer, corregir una novedad…). */
export interface BorradorMovimiento {
  tipo: FormularioMovimiento['tipo'];
  sentidoAjuste?: FormularioMovimiento['sentidoAjuste'];
  origenUbicacionId?: string;
  destinoUbicacionId?: string;
  motivo?: string;
  lineas?: { insumoId: string; loteId?: string | null; equipoId?: string | null; cantidad: number }[];
}

export const esquemaAnulacion = z.object({
  motivo: z.string().trim().min(1, 'Escribe por qué se anula.').max(150, 'Máximo 150 caracteres.'),
});

export type FormularioAnulacion = z.infer<typeof esquemaAnulacion>;
