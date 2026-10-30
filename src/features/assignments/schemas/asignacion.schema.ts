import { z } from 'zod';

export const LONGITUD_MAXIMA_MOTIVO = 255;

export const esquemaCancelarAsignacion = z.object({
  motivo: z
    .string()
    .trim()
    .min(5, 'Describe el motivo con al menos 5 caracteres.')
    .max(LONGITUD_MAXIMA_MOTIVO, `Máximo ${LONGITUD_MAXIMA_MOTIVO} caracteres.`),
});

export type FormularioCancelarAsignacion = z.infer<typeof esquemaCancelarAsignacion>;

/** Al cerrar sin traslado (desde la escena o la atención) el backend exige el motivo. */
export function esquemaFinalizarServicio(exigeObservacion: boolean) {
  const observacion = z
    .string()
    .trim()
    .max(LONGITUD_MAXIMA_MOTIVO, `Máximo ${LONGITUD_MAXIMA_MOTIVO} caracteres.`);
  return z.object({
    observacion: exigeObservacion
      ? observacion.min(5, 'Explica por qué se cierra sin traslado, con al menos 5 caracteres.')
      : observacion,
  });
}

export type FormularioFinalizarServicio = z.infer<ReturnType<typeof esquemaFinalizarServicio>>;
