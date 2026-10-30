import { ETIQUETAS_EVENTO } from '../constants/asignaciones';
import type { Asignacion, EventoAsignacion } from '../types/asignacion.types';

export interface PasoAsignacion {
  clave: string;
  etiqueta: string;
  /** Momento en que ocurrió; `null` si aún no ocurre. */
  en: string | null;
}

/**
 * Pasos de la línea de tiempo según las fechas que registró el backend.
 * Si cerró sin traslado no se muestran el traslado ni la entrega; un servicio cancelado termina en "Cancelada".
 */
export function pasosAsignacion(asignacion: Asignacion): PasoAsignacion[] {
  const pasos: PasoAsignacion[] = [
    { clave: 'asignada', etiqueta: 'Asignada', en: asignacion.asignadaEn },
    { clave: 'en_camino', etiqueta: 'Salida', en: asignacion.salidaEn },
  ];

  if (asignacion.estado === 'cancelada') {
    if (!asignacion.salidaEn) pasos.pop();
    pasos.push({ clave: 'cancelada', etiqueta: 'Cancelada', en: asignacion.finalizadaEn });
    return pasos;
  }

  pasos.push({ clave: 'en_escena', etiqueta: 'En la escena', en: asignacion.llegadaEscenaEn });
  pasos.push({ clave: 'atendiendo', etiqueta: 'Atención', en: asignacion.atencionInicioEn });

  // Sin traslado (atendido en el sitio, rechazo…) el servicio cierra desde la escena.
  const sinTraslado = asignacion.estado === 'finalizada' && asignacion.salidaEscenaEn === null;
  if (!sinTraslado) {
    pasos.push({ clave: 'trasladando', etiqueta: 'A bordo', en: asignacion.salidaEscenaEn });
    pasos.push({ clave: 'destino', etiqueta: 'Entrega', en: asignacion.llegadaDestinoEn });
  }
  pasos.push({ clave: 'finalizada', etiqueta: 'Finalizada', en: asignacion.finalizadaEn });
  return pasos;
}

/** Minutos entre la asignación y la llegada a la escena, calculados con las fechas del backend. */
export function minutosDeRespuesta(asignacion: Asignacion): number | null {
  if (!asignacion.llegadaEscenaEn) return null;
  const milisegundos = new Date(asignacion.llegadaEscenaEn).getTime() - new Date(asignacion.asignadaEn).getTime();
  return Number.isFinite(milisegundos) ? Math.max(Math.round(milisegundos / 60_000), 0) : null;
}

/** Finalizar desde el traslado es la entrega; desde la escena o la atención, un cierre sin traslado. */
export function etiquetaEvento({ estadoNuevo, estadoAnterior }: Pick<EventoAsignacion, 'estadoNuevo' | 'estadoAnterior'>): string {
  if (estadoNuevo !== 'finalizada') return ETIQUETAS_EVENTO[estadoNuevo];
  return estadoAnterior === 'trasladando' ? 'Paciente entregado' : 'Cerrado sin traslado';
}
