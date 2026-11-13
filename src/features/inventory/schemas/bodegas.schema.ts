import { z } from 'zod';
import { RANGO_HUMEDAD, RANGO_TEMPERATURA } from '../constants/catalogos_inventario';
import { idObligatorio, textoObligatorio, textoOpcional } from './comunes.schema';

export const esquemaBodega = z.object({
  codigo: textoObligatorio(50, 'Escribe el código.'),
  nombre: textoObligatorio(150, 'Escribe el nombre.'),
  ubicacion: textoOpcional(250),
  responsableId: z.string().transform((valor) => (valor === '' ? null : valor)),
});

export type EntradaBodega = z.input<typeof esquemaBodega>;
export type FormularioBodega = z.output<typeof esquemaBodega>;

const PATRON_LECTURA = /^-?\d+([.,]\d{1,2})?$/;

/** Lectura opcional con hasta 2 decimales dentro de un rango. */
const lectura = (rango: { minimo: number; maximo: number }, unidad: string) =>
  z
    .string()
    .trim()
    .refine((valor) => valor === '' || PATRON_LECTURA.test(valor), 'Usa un número con hasta 2 decimales.')
    .transform((valor) => (valor === '' ? null : Number(valor.replace(',', '.'))))
    .refine(
      (valor) => valor === null || (valor >= rango.minimo && valor <= rango.maximo),
      `Debe estar entre ${rango.minimo} y ${rango.maximo} ${unidad}.`,
    );

export const esquemaControl = z
  .object({
    ubicacionId: idObligatorio('Elige dónde se tomó la lectura.'),
    temperatura: lectura(RANGO_TEMPERATURA, '°C'),
    humedad: lectura(RANGO_HUMEDAD, '%'),
    observaciones: textoOpcional(5000),
  })
  .superRefine(({ temperatura, humedad }, contexto) => {
    if (temperatura === null && humedad === null) {
      contexto.addIssue({ code: 'custom', path: ['temperatura'], message: 'Registra la temperatura, la humedad o ambas.' });
    }
  });

export type EntradaControl = z.input<typeof esquemaControl>;
export type FormularioControl = z.output<typeof esquemaControl>;
