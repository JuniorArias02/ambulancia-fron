import { z } from 'zod';
import type { ControlInsumo } from '../types/inventario.types';
import { cantidad, cantidadOpcional, diaOpcional, idObligatorio, textoObligatorio, textoOpcional } from './comunes.schema';

const camposVigencia = {
  nombre: textoObligatorio(150, 'Escribe el nombre.'),
  descripcion: textoOpcional(5000),
  vigenteDesde: diaOpcional(),
  vigenteHasta: diaOpcional(),
};

function revisarVigencia(datos: { vigenteDesde: string | null; vigenteHasta: string | null }, contexto: z.RefinementCtx) {
  if (datos.vigenteDesde && datos.vigenteHasta && datos.vigenteHasta < datos.vigenteDesde) {
    contexto.addIssue({ code: 'custom', path: ['vigenteHasta'], message: 'Debe ser posterior al inicio de la vigencia.' });
  }
}

export const esquemaDatosPerfil = z.object(camposVigencia).superRefine(revisarVigencia);
export type EntradaDatosPerfil = z.input<typeof esquemaDatosPerfil>;
export type FormularioDatosPerfil = z.output<typeof esquemaDatosPerfil>;

export const esquemaCrearPerfil = z
  .object({
    tipoAmbulanciaId: idObligatorio('Elige el tipo de ambulancia.'),
    codigo: textoObligatorio(50, 'Escribe el código.'),
    ...camposVigencia,
  })
  .superRefine(revisarVigencia);
export type EntradaCrearPerfil = z.input<typeof esquemaCrearPerfil>;
export type FormularioCrearPerfil = z.output<typeof esquemaCrearPerfil>;

const camposDetalle = {
  cantidadRequerida: cantidad({ minimo: 0.001, mensaje: 'Escribe la cantidad requerida.' }),
  /** Vacía equivale a la requerida. */
  cantidadMinima: cantidadOpcional(),
  obligatorio: z.boolean(),
  observaciones: textoOpcional(5000),
};

/** La mínima no supera la requerida y los equipos (por serie) piden enteros. */
function revisarCantidades(
  datos: { cantidadRequerida: number; cantidadMinima: number | null },
  control: ControlInsumo | undefined,
  contexto: z.RefinementCtx,
) {
  if (datos.cantidadMinima !== null && datos.cantidadMinima > datos.cantidadRequerida) {
    contexto.addIssue({ code: 'custom', path: ['cantidadMinima'], message: 'No puede superar la requerida.' });
  }
  if (control === 'serie') {
    if (!Number.isInteger(datos.cantidadRequerida)) {
      contexto.addIssue({ code: 'custom', path: ['cantidadRequerida'], message: 'Los equipos piden cantidades enteras.' });
    }
    if (datos.cantidadMinima !== null && !Number.isInteger(datos.cantidadMinima)) {
      contexto.addIssue({ code: 'custom', path: ['cantidadMinima'], message: 'Los equipos piden cantidades enteras.' });
    }
  }
}

export function esquemaDetalle(control: ControlInsumo | undefined) {
  return z.object(camposDetalle).superRefine((datos, contexto) => revisarCantidades(datos, control, contexto));
}
export type EntradaDetalle = z.input<ReturnType<typeof esquemaDetalle>>;
export type FormularioDetalle = z.output<ReturnType<typeof esquemaDetalle>>;

export function esquemaNuevoDetalle(controlDe: (insumoId: string) => ControlInsumo | undefined) {
  return z
    .object({ insumoId: idObligatorio('Elige el insumo.'), ...camposDetalle })
    .superRefine((datos, contexto) => revisarCantidades(datos, controlDe(datos.insumoId), contexto));
}
export type EntradaNuevoDetalle = z.input<ReturnType<typeof esquemaNuevoDetalle>>;
export type FormularioNuevoDetalle = z.output<ReturnType<typeof esquemaNuevoDetalle>>;
