import { z } from 'zod';

const PATRON_CANTIDAD = /^\d+([.,]\d{1,3})?$/;
const PATRON_DIA = /^\d{4}-\d{2}-\d{2}$/;

/** Texto opcional: vacío se envía como `null`. */
export const textoOpcional = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo, `Máximo ${maximo} caracteres.`)
    .transform((valor) => (valor === '' ? null : valor));

export const textoObligatorio = (maximo: number, mensaje: string) =>
  z.string().trim().min(1, mensaje).max(maximo, `Máximo ${maximo} caracteres.`);

/** Cantidad con hasta 3 decimales (coma o punto), como DECIMAL(12,3). */
export const cantidad = ({ minimo = 0, mensaje = 'Escribe una cantidad.' }: { minimo?: number; mensaje?: string } = {}) =>
  z
    .string()
    .trim()
    .min(1, mensaje)
    .regex(PATRON_CANTIDAD, 'Usa un número con hasta 3 decimales.')
    .transform((valor) => Number(valor.replace(',', '.')))
    .refine((valor) => valor >= minimo, minimo > 0 ? 'Debe ser mayor que 0.' : 'No puede ser negativa.');

/** Cantidad opcional: vacía es `null`. */
export const cantidadOpcional = () =>
  z
    .string()
    .trim()
    .refine((valor) => valor === '' || PATRON_CANTIDAD.test(valor), 'Usa un número con hasta 3 decimales.')
    .transform((valor) => (valor === '' ? null : Number(valor.replace(',', '.'))));

/** Día `AAAA-MM-DD` opcional (de un `<input type="date">`). */
export const diaOpcional = () =>
  z
    .string()
    .refine((valor) => valor === '' || PATRON_DIA.test(valor), 'Fecha no válida.')
    .transform((valor) => (valor === '' ? null : valor));

export const diaObligatorio = (mensaje: string) => z.string().regex(PATRON_DIA, mensaje);

/** Selector con opción vacía: exige elegir un valor del catálogo. */
export const opcionDe = <T extends string>(catalogo: readonly [T, ...T[]], mensaje: string) =>
  z.union([z.literal(''), z.enum(catalogo)]).pipe(z.enum(catalogo, { message: mensaje }));

/** Selector de un id con opción vacía. */
export const idObligatorio = (mensaje: string) => z.string().min(1, mensaje);
