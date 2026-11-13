import { z } from 'zod';
import { LONGITUD_MAXIMA_RESOLUCION } from '../constants/catalogos_inventario';

export const esquemaRevision = z.object({
  resolucion: z
    .string()
    .trim()
    .min(1, 'Escribe cómo se resolvieron las novedades.')
    .max(LONGITUD_MAXIMA_RESOLUCION, `Máximo ${LONGITUD_MAXIMA_RESOLUCION} caracteres.`),
});

export type FormularioRevision = z.infer<typeof esquemaRevision>;
