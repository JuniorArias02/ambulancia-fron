import { distanciaEnLineaRecta, type PuntoMapa } from './coordenadas';

const RADIO_TIERRA_METROS = 6_371_000;

/**
 * Hasta esta distancia se considera que la ambulancia va por la ruta y su marcador se dibuja
 * sobre la línea (absorbe el error normal del GPS). Más lejos se muestra donde realmente está:
 * el backend recalcula la ruta si se desvía más de 150 m.
 */
export const UMBRAL_AJUSTE_RUTA_M = 50;

export interface ProyeccionTrazo {
  /** Punto del trazo más cercano. */
  punto: PuntoMapa;
  /** Metros desde el inicio del trazo hasta ese punto. */
  distanciaRecorrida: number;
  /** Metros entre el punto original y el trazo. */
  distanciaAlTrazo: number;
}

export interface AjusteAlTrazo {
  /** Dónde dibujar el marcador. */
  punto: PuntoMapa;
  sobreRuta: boolean;
  distanciaRecorrida: number;
}

/** Plano local en metros alrededor de `origen`: suficiente para tramos de calle cortos. */
function aMetros(origen: PuntoMapa, punto: PuntoMapa): [number, number] {
  const latitudOrigen = (origen.latitud * Math.PI) / 180;
  return [
    (((punto.longitud - origen.longitud) * Math.PI) / 180) * RADIO_TIERRA_METROS * Math.cos(latitudOrigen),
    (((punto.latitud - origen.latitud) * Math.PI) / 180) * RADIO_TIERRA_METROS,
  ];
}

function interpolar(a: PuntoMapa, b: PuntoMapa, t: number): PuntoMapa {
  return { latitud: a.latitud + (b.latitud - a.latitud) * t, longitud: a.longitud + (b.longitud - a.longitud) * t };
}

/** Metros acumulados desde el inicio hasta cada vértice. */
export function longitudesAcumuladas(trazo: readonly PuntoMapa[]): number[] {
  const acumuladas = [0];
  for (let i = 1; i < trazo.length; i++) {
    const anterior = trazo[i - 1];
    const actual = trazo[i];
    const previa = acumuladas[i - 1] ?? 0;
    acumuladas.push(anterior && actual ? previa + distanciaEnLineaRecta(anterior, actual) : previa);
  }
  return acumuladas;
}

/** Proyección del punto sobre el tramo más cercano del trazo. */
export function proyectarSobreTrazo(punto: PuntoMapa, trazo: readonly PuntoMapa[]): ProyeccionTrazo | null {
  if (trazo.length < 2) return null;
  const acumuladas = longitudesAcumuladas(trazo);
  let mejor: ProyeccionTrazo | null = null;

  for (let i = 0; i < trazo.length - 1; i++) {
    const a = trazo[i];
    const b = trazo[i + 1];
    if (!a || !b) continue;
    const [bx, by] = aMetros(a, b);
    const [px, py] = aMetros(a, punto);
    const largo2 = bx * bx + by * by;
    const t = largo2 === 0 ? 0 : Math.min(Math.max((px * bx + py * by) / largo2, 0), 1);
    const distanciaAlTrazo = Math.hypot(px - t * bx, py - t * by);
    if (!mejor || distanciaAlTrazo < mejor.distanciaAlTrazo) {
      const inicio = acumuladas[i] ?? 0;
      const fin = acumuladas[i + 1] ?? inicio;
      mejor = { punto: interpolar(a, b, t), distanciaRecorrida: inicio + t * (fin - inicio), distanciaAlTrazo };
    }
  }
  return mejor;
}

/** Punto del trazo a `distancia` metros de su inicio (acotado a sus extremos). */
export function puntoEnDistancia(trazo: readonly PuntoMapa[], distancia: number): PuntoMapa | null {
  const primero = trazo[0];
  if (!primero) return null;
  const acumuladas = longitudesAcumuladas(trazo);
  if (distancia <= 0) return primero;
  for (let i = 1; i < trazo.length; i++) {
    const fin = acumuladas[i] ?? 0;
    if (distancia <= fin) {
      const inicio = acumuladas[i - 1] ?? 0;
      const a = trazo[i - 1];
      const b = trazo[i];
      if (!a || !b) break;
      return interpolar(a, b, fin === inicio ? 0 : (distancia - inicio) / (fin - inicio));
    }
  }
  return trazo.at(-1) ?? primero;
}

/** Tramo ya recorrido y tramo restante; el punto de corte pertenece a ambos para que no haya hueco. */
export function dividirTrazo(
  trazo: readonly PuntoMapa[],
  distanciaRecorrida: number,
): { recorrido: PuntoMapa[]; restante: PuntoMapa[] } {
  const corte = puntoEnDistancia(trazo, distanciaRecorrida);
  if (!corte) return { recorrido: [], restante: [] };
  const acumuladas = longitudesAcumuladas(trazo);
  const recorrido: PuntoMapa[] = [];
  const restante: PuntoMapa[] = [];
  trazo.forEach((punto, i) => {
    if ((acumuladas[i] ?? 0) < distanciaRecorrida) recorrido.push(punto);
    else restante.push(punto);
  });
  return { recorrido: [...recorrido, corte], restante: [corte, ...restante] };
}

/** Si el GPS está cerca de la ruta, el marcador se dibuja sobre ella; si no, donde realmente está. */
export function ajustarAlTrazo(
  punto: PuntoMapa,
  trazo: readonly PuntoMapa[],
  umbralMetros = UMBRAL_AJUSTE_RUTA_M,
): AjusteAlTrazo {
  const proyeccion = proyectarSobreTrazo(punto, trazo);
  const sobreRuta = proyeccion !== null && proyeccion.distanciaAlTrazo <= umbralMetros;
  return {
    punto: sobreRuta ? proyeccion.punto : punto,
    sobreRuta,
    distanciaRecorrida: proyeccion?.distanciaRecorrida ?? 0,
  };
}
