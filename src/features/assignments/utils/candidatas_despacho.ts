import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { senalUbicacion, type SenalUbicacion } from '../../ambulances/utils/senal_ubicacion';
import { distanciaEnLineaRecta, type PuntoMapa } from '../../map/utils/coordenadas';

export interface Candidata {
  ambulancia: Ambulancia;
  /** En línea recta desde la última posición conocida; `null` si falta alguna ubicación. */
  distanciaMetros: number | null;
  senal: SenalUbicacion;
}

/**
 * Ambulancias disponibles ordenadas de la más cercana a la más lejana.
 * Las que no tienen ubicación van al final, por código.
 */
export function ordenarCandidatas(ambulancias: Ambulancia[], destino: PuntoMapa | null, ahora: number): Candidata[] {
  return ambulancias
    .map((ambulancia) => ({
      ambulancia,
      senal: senalUbicacion(ambulancia.ultimaUbicacion, ahora),
      distanciaMetros:
        destino && ambulancia.ultimaUbicacion ? distanciaEnLineaRecta(ambulancia.ultimaUbicacion, destino) : null,
    }))
    .sort((a, b) => {
      if (a.distanciaMetros === null || b.distanciaMetros === null) {
        if (a.distanciaMetros !== b.distanciaMetros) return a.distanciaMetros === null ? 1 : -1;
        return a.ambulancia.codigo.localeCompare(b.ambulancia.codigo, 'es');
      }
      return a.distanciaMetros - b.distanciaMetros;
    });
}
