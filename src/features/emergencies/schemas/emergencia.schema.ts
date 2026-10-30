import { z } from 'zod';
import {
  catalogoOpcional,
  latitud,
  longitud,
  telefonoOpcional,
  textoOpcional,
  validarCoordenadasJuntas,
} from '../../../schemas/campos.schema';
import { FUENTES, PRIORIDADES, TIPOS_INCIDENTE } from '../constants/catalogos_emergencia';

export const LONGITUD_MAXIMA_DESCRIPCION = 5000;
export const LONGITUD_MAXIMA_MOTIVO = 255;

export const esquemaEmergencia = z
  .object({
    fuente: z
      .union([z.literal(''), z.enum(FUENTES)])
      .pipe(z.enum(FUENTES, { message: 'Selecciona la fuente del reporte.' })),
    descripcion: z
      .string()
      .trim()
      .min(5, 'Describe la emergencia con al menos 5 caracteres.')
      .max(LONGITUD_MAXIMA_DESCRIPCION, `Máximo ${LONGITUD_MAXIMA_DESCRIPCION} caracteres.`),
    informanteNombre: textoOpcional(150),
    informanteTelefono: telefonoOpcional(),
    tipoIncidente: catalogoOpcional(TIPOS_INCIDENTE),
    prioridad: catalogoOpcional(PRIORIDADES),
    direccion: textoOpcional(255),
    referenciaLugar: textoOpcional(255),
    latitud: latitud(),
    longitud: longitud(),
    numeroVictimas: z
      .string()
      .trim()
      .refine((valor) => valor === '' || (/^\d{1,3}$/.test(valor) && Number(valor) <= 500), {
        message: 'Un número entero entre 0 y 500.',
      })
      .transform((valor) => (valor === '' ? null : Number(valor))),
  })
  .superRefine((datos, contexto) => {
    validarCoordenadasJuntas(datos, contexto);
    if (datos.direccion === null && datos.latitud === null && datos.longitud === null) {
      contexto.addIssue({
        code: 'custom',
        path: ['direccion'],
        message: 'Indica la dirección o marca el punto en el mapa.',
      });
    }
  });

export type EntradaEmergencia = z.input<typeof esquemaEmergencia>;
export type FormularioEmergencia = z.output<typeof esquemaEmergencia>;

export const esquemaCancelarEmergencia = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, 'Describe el motivo con al menos 5 caracteres.')
    .max(LONGITUD_MAXIMA_MOTIVO, `Máximo ${LONGITUD_MAXIMA_MOTIVO} caracteres.`),
});

export type FormularioCancelarEmergencia = z.infer<typeof esquemaCancelarEmergencia>;
