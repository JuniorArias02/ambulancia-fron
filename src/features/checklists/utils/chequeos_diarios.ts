import type { RespuestaChequeo } from '../types/chequeo_diario.types';

export function contarObservaciones(respuestas: readonly RespuestaChequeo[]): number {
  return respuestas.filter((respuesta) => respuesta.tieneObservacion).length;
}

/**
 * Novedad de la ambulancia: una respuesta con observación o con una calificación distinta de
 * la mejor. Sin `mejorOpcionId` (no se conoce la escala), solo cuentan las observaciones.
 */
export function esNovedad(respuesta: RespuestaChequeo, mejorOpcionId: string | undefined): boolean {
  return respuesta.tieneObservacion || (mejorOpcionId !== undefined && respuesta.estadoId !== mejorOpcionId);
}

const formatoDia = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/** `2026-11-10` → `mar, 10 nov 2026`, sin desfase de zona horaria. */
export function formatearDia(dia: string): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  if (!partes) return dia;
  return formatoDia.format(new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3])));
}
