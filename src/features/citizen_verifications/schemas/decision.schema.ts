import { z } from 'zod';
import { LONGITUD_MAXIMA_MOTIVO, LONGITUD_MAXIMA_OBSERVACIONES } from '../constants/verificaciones';

/** Rechazar y pedir corrección exigen un motivo, que el ciudadano lee en la app. */
export const esquemaDecisionConMotivo = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, 'Escribe el motivo que verá el ciudadano.')
    .max(LONGITUD_MAXIMA_MOTIVO, `Máximo ${LONGITUD_MAXIMA_MOTIVO} caracteres.`),
  observaciones: z
    .string()
    .trim()
    .max(LONGITUD_MAXIMA_OBSERVACIONES, `Máximo ${LONGITUD_MAXIMA_OBSERVACIONES} caracteres.`),
});

export type FormularioDecisionConMotivo = z.infer<typeof esquemaDecisionConMotivo>;
