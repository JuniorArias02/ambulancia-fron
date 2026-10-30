import { z } from 'zod';
import { esquemaRuta } from '../../assignments/schemas/ruta.schema';
import { PRIORIDADES } from '../../emergencies/constants/catalogos_emergencia';
import type { EventoTiempoReal } from '../types/tiempo_real.types';

const fecha = z.iso.datetime({ offset: true });
const identificador = z.string().min(1);

// Objetos abiertos: el servidor envía el DTO completo del REST y aquí solo se exige lo que se usa.
const emergencia = z.object({
  emergencia: z.looseObject({
    id: identificador,
    numeroEmergencia: z.string(),
    prioridad: z.enum(PRIORIDADES).nullable(),
    recibidaPor: z.looseObject({ id: identificador }).nullable(),
  }),
});

const asignacion = z.object({
  asignacion: z.looseObject({
    id: identificador,
    emergenciaId: identificador,
    ambulanciaId: identificador,
    // Para avisar a la central de la llegada y de que el paciente va a bordo.
    estado: z.string().optional(),
    ambulanciaCodigo: z.string().nullable().optional(),
    numeroEmergencia: z.string().nullable().optional(),
  }),
});

const sobre = z.object({ id: identificador, ocurridoEn: fecha });

export const esquemaEvento = z.discriminatedUnion('tipo', [
  sobre.extend({ tipo: z.literal('emergencia.creada'), datos: emergencia }),
  sobre.extend({ tipo: z.literal('emergencia.actualizada'), datos: emergencia }),
  sobre.extend({
    tipo: z.literal('emergencia.posible_duplicado'),
    datos: z.object({ emergenciaId: identificador, numeroEmergencia: z.string(), posibles: z.array(z.unknown()) }),
  }),
  sobre.extend({ tipo: z.literal('asignacion.creada'), datos: asignacion }),
  sobre.extend({ tipo: z.literal('asignacion.actualizada'), datos: asignacion }),
  sobre.extend({
    tipo: z.literal('ambulancia.actualizada'),
    datos: z.object({ ambulancia: z.looseObject({ id: identificador }) }),
  }),
  sobre.extend({
    tipo: z.literal('ambulancia.ubicacion_actualizada'),
    datos: z.object({
      ambulanciaId: identificador,
      asignacionId: identificador.nullable(),
      latitud: z.number().min(-90).max(90),
      longitud: z.number().min(-180).max(180),
      velocidad: z.number().nullable(),
      registradaEn: fecha,
    }),
  }),
  sobre.extend({
    tipo: z.literal('turno.actualizado'),
    datos: z.object({ turno: z.looseObject({ id: identificador, ambulanciaId: identificador }) }),
  }),
  // La ruta se valida completa: se escribe tal cual en la caché del mapa.
  sobre.extend({ tipo: z.literal('asignacion.ruta_actualizada'), datos: z.object({ ruta: esquemaRuta }) }),
]);

/**
 * Valida un aviso recibido. Devuelve `null` si no es de los que usa la web
 * (p. ej. `mi_servicio.actualizado`, propio de la app móvil) o si llega mal formado.
 */
export function leerEvento(tipo: string, carga: unknown): EventoTiempoReal | null {
  if (typeof carga !== 'object' || carga === null) return null;
  const resultado = esquemaEvento.safeParse({ ...carga, tipo });
  return resultado.success ? resultado.data : null;
}
