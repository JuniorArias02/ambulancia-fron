import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import type { UbicacionAmbulancia } from '../types/ambulancia.types';

/**
 * Una posición vieja puede engañar al despachador: puede creer que la ambulancia está cerca
 * cuando ya se movió. `atrasada` se pinta semitransparente y `sin_senal`, en gris.
 */
export type SenalUbicacion = 'reciente' | 'atrasada' | 'sin_senal' | 'ninguna';

export const UMBRAL_ATRASADA_MS = 2 * 60_000;
export const UMBRAL_SIN_SENAL_MS = 10 * 60_000;

const formatoHora = new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' });

/** Se calcula con la hora del navegador; la pantalla la vuelve a evaluar periódicamente. */
export function senalUbicacion(ubicacion: UbicacionAmbulancia | null, ahora: number): SenalUbicacion {
  if (!ubicacion) return 'ninguna';
  const antiguedad = ahora - new Date(ubicacion.registradaEn).getTime();
  if (!Number.isFinite(antiguedad) || antiguedad > UMBRAL_SIN_SENAL_MS) return 'sin_senal';
  return antiguedad >= UMBRAL_ATRASADA_MS ? 'atrasada' : 'reciente';
}

/** `Posición de hace un momento`, `Posición de hace 5 min` o `Sin señal desde las 2:35 p. m.`. */
export function textoSenal(ubicacion: UbicacionAmbulancia | null, ahora: number): string {
  if (!ubicacion) return 'Sin ubicación';
  const senal = senalUbicacion(ubicacion, ahora);
  if (senal === 'sin_senal') {
    const fecha = new Date(ubicacion.registradaEn);
    return Number.isNaN(fecha.getTime()) ? 'Sin señal' : `Sin señal desde las ${formatoHora.format(fecha)}`;
  }
  return `Posición de ${haceTiempo(ubicacion.registradaEn, ahora)}`;
}
