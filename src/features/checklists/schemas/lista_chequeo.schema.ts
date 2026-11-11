import { z } from 'zod';
import { LONGITUDES_LISTA, MINIMO_OPCIONES, MINIMO_PREGUNTAS } from '../constants/listas_chequeo';

const textoPregunta = z
  .string()
  .trim()
  .min(1, 'Escribe la pregunta.')
  .max(LONGITUDES_LISTA.pregunta, `Máximo ${LONGITUDES_LISTA.pregunta} caracteres.`);

const nombreOpcion = z
  .string()
  .trim()
  .min(1, 'Escribe el nombre.')
  .max(LONGITUDES_LISTA.opcion, `Máximo ${LONGITUDES_LISTA.opcion} caracteres.`);

/** Puntaje opcional: vacío o un entero. */
const valorOpcion = z
  .string()
  .trim()
  .regex(/^-?\d*$/, 'Usa un número entero.')
  .transform((valor) => (valor === '' ? null : Number(valor)));

const nombreLista = z
  .string()
  .trim()
  .min(1, 'Escribe el nombre de la lista.')
  .max(LONGITUDES_LISTA.nombre, `Máximo ${LONGITUDES_LISTA.nombre} caracteres.`);

const descripcionLista = z
  .string()
  .trim()
  .max(LONGITUDES_LISTA.descripcion, `Máximo ${LONGITUDES_LISTA.descripcion} caracteres.`);

export const esquemaPregunta = z.object({ pregunta: textoPregunta });
export type FormularioPregunta = z.infer<typeof esquemaPregunta>;

export const esquemaOpcion = z.object({ nombre: nombreOpcion, valor: valorOpcion });
export type EntradaOpcion = z.input<typeof esquemaOpcion>;
export type FormularioOpcion = z.output<typeof esquemaOpcion>;

/** El backend las rechaza repetidas sin importar mayúsculas (422); se avisa antes. */
function marcarRepetidos(textos: string[], ruta: (indice: number) => (string | number)[], mensaje: string, contexto: z.RefinementCtx) {
  const vistos = new Set<string>();
  textos.forEach((texto, indice) => {
    const clave = texto.trim().toLocaleLowerCase('es');
    if (!clave) return;
    if (vistos.has(clave)) contexto.addIssue({ code: 'custom', path: ruta(indice), message: mensaje });
    vistos.add(clave);
  });
}

export const esquemaCrearLista = z
  .object({
    nombre: nombreLista,
    descripcion: descripcionLista,
    items: z
      .array(z.object({ pregunta: textoPregunta, obligatorio: z.boolean(), permiteObservacion: z.boolean() }))
      .min(MINIMO_PREGUNTAS, 'Agrega al menos una pregunta.'),
    estados: z
      .array(z.object({ nombre: nombreOpcion, valor: valorOpcion }))
      .min(MINIMO_OPCIONES, `Agrega al menos ${MINIMO_OPCIONES} opciones.`),
  })
  .superRefine(({ items, estados }, contexto) => {
    marcarRepetidos(items.map((item) => item.pregunta), (i) => ['items', i, 'pregunta'], 'Pregunta repetida.', contexto);
    marcarRepetidos(estados.map((estado) => estado.nombre), (i) => ['estados', i, 'nombre'], 'Opción repetida.', contexto);
  });

export type EntradaCrearLista = z.input<typeof esquemaCrearLista>;
export type FormularioCrearLista = z.output<typeof esquemaCrearLista>;

export const esquemaDatosLista = z.object({ nombre: nombreLista, descripcion: descripcionLista });
export type FormularioDatosLista = z.infer<typeof esquemaDatosLista>;
