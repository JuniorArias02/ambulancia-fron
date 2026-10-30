import { z } from 'zod';

const punto = z.object({ latitud: z.number().min(-90).max(90), longitud: z.number().min(-180).max(180) });

/**
 * Ruta por calles que calcula el backend; el frontend solo la dibuja.
 * Se valida al recibirla por tiempo real porque se escribe directo en la caché.
 */
export const esquemaRuta = z.looseObject({
  asignacionId: z.string().min(1),
  ambulanciaId: z.string().min(1),
  ambulanciaCodigo: z.string().nullable(),
  emergenciaId: z.string().min(1),
  numeroEmergencia: z.string().nullable(),
  tramo: z.string(),
  /** `despacho`, `sin_ruta` (se calculó con el primer GPS) o `desvio` (se recalculó por desvío). */
  motivo: z.string(),
  origen: punto,
  destino: punto,
  /** GeoJSON `LineString`: cada par es `[longitud, latitud]`, al revés de como lo usa Leaflet. */
  geometria: z.object({
    type: z.literal('LineString'),
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(2),
  }),
  distanciaMetros: z.number().nonnegative(),
  duracionSegundos: z.number().nonnegative(),
  /** `calculadaEn` + la duración, sin tráfico en vivo: se muestra como aproximada. */
  llegadaEstimada: z.iso.datetime({ offset: true }),
  proveedor: z.string(),
  calculadaEn: z.iso.datetime({ offset: true }),
});

export type Ruta = z.infer<typeof esquemaRuta>;
