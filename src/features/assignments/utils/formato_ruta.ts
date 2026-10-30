import type { PuntoMapa } from '../../map/utils/coordenadas';
import { ESTADOS_CON_RUTA } from '../constants/asignaciones';
import type { Ruta } from '../schemas/ruta.schema';
import type { Asignacion } from '../types/asignacion.types';

const formatoKilometros = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });
const formatoHora = new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' });

/** `850 m`, `2,5 km`. */
export function textoDistanciaRuta(metros: number): string {
  return metros < 1000 ? `${Math.round(metros)} m` : `${formatoKilometros.format(metros / 1000)} km`;
}

/** Siempre aproximado: el proveedor estima con velocidades típicas, sin tráfico en vivo. */
export function textoDuracion(segundos: number): string {
  const minutos = Math.max(Math.round(segundos / 60), 1);
  if (minutos < 60) return `≈ ${minutos} min`;
  return `≈ ${Math.floor(minutos / 60)} h ${String(minutos % 60).padStart(2, '0')} min`;
}

export function textoLlegada(llegadaEstimada: string): string {
  const fecha = new Date(llegadaEstimada);
  return Number.isNaN(fecha.getTime()) ? '' : `llega ≈ ${formatoHora.format(fecha)}`;
}

/** `2,5 km · ≈ 4 min · llega ≈ 6:55 p. m.`. */
export function resumenRuta(ruta: Ruta): string {
  return [textoDistanciaRuta(ruta.distanciaMetros), textoDuracion(ruta.duracionSegundos), textoLlegada(ruta.llegadaEstimada)]
    .filter(Boolean)
    .join(' · ');
}

/** La geometría llega en GeoJSON (`[longitud, latitud]`); el resto de la interfaz usa `PuntoMapa`. */
export function trazoDeRuta(ruta: Ruta): PuntoMapa[] {
  return ruta.geometria.coordinates.map(([longitud, latitud]) => ({ latitud, longitud }));
}

export function tieneRuta(asignacion: Asignacion): boolean {
  return ESTADOS_CON_RUTA.includes(asignacion.estado);
}

/**
 * Ruta vigente de cada ambulancia: solo la de servicios que siguen `asignada` o `en_camino`.
 * Al llegar a la escena, finalizar o cancelar, la línea desaparece sin esperar otra consulta.
 */
export function rutasVigentesPorAmbulancia(
  rutas: Ruta[],
  asignacionesPorAmbulancia: Map<string, Asignacion>,
): Map<string, Ruta> {
  const vigentes = new Map<string, Ruta>();
  for (const ruta of rutas) {
    const asignacion = asignacionesPorAmbulancia.get(ruta.ambulanciaId);
    if (asignacion?.id === ruta.asignacionId && tieneRuta(asignacion)) vigentes.set(ruta.ambulanciaId, ruta);
  }
  return vigentes;
}
