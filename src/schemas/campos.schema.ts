import { z } from 'zod';

// Reglas de campos que se repiten en varios formularios; reflejan las validaciones del backend.
export const PATRON_TELEFONO = /^\+?[0-9\s-]{7,20}$/;
const PATRON_COORDENADA = /^-?\d{1,3}(\.\d{1,7})?$/;

/** Vacío significa "sin dato" (`null`). */
export function textoOpcional(maximo: number) {
  return z
    .string()
    .trim()
    .max(maximo, `Máximo ${maximo} caracteres.`)
    .transform((valor) => (valor === '' ? null : valor));
}

export function telefonoOpcional() {
  return z
    .string()
    .trim()
    .refine((valor) => valor === '' || PATRON_TELEFONO.test(valor), {
      message: 'De 7 a 20 caracteres: dígitos, espacios, guiones y + inicial.',
    })
    .transform((valor) => (valor === '' ? null : valor));
}

/** Acepta coma o punto decimal; vacío significa "sin coordenada". */
export function coordenada(limite: number, mensaje: string) {
  return z
    .string()
    .trim()
    .transform((valor) => valor.replace(',', '.'))
    .refine((valor) => valor === '' || (PATRON_COORDENADA.test(valor) && Math.abs(Number(valor)) <= limite), {
      message: mensaje,
    })
    .transform((valor) => (valor === '' ? null : Number(valor)));
}

export const latitud = () => coordenada(90, 'Entre -90 y 90, con hasta 7 decimales.');
export const longitud = () => coordenada(180, 'Entre -180 y 180, con hasta 7 decimales.');

/** Los selectores empiezan vacíos (''), que equivale a "sin dato". */
export function catalogoOpcional<const T extends readonly [string, ...string[]]>(valores: T) {
  return z.union([z.literal(''), z.enum(valores)]).transform((valor) => (valor === '' ? null : valor));
}

/** El backend exige latitud y longitud juntas. */
export function validarCoordenadasJuntas(
  datos: { latitud: number | null; longitud: number | null },
  contexto: z.RefinementCtx,
): void {
  if ((datos.latitud === null) !== (datos.longitud === null)) {
    contexto.addIssue({
      code: 'custom',
      path: [datos.latitud === null ? 'latitud' : 'longitud'],
      message: 'Ingresa la latitud y la longitud juntas.',
    });
  }
}
