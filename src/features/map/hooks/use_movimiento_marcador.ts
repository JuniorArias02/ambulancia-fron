import type L from 'leaflet';
import { useEffect, useRef, type RefObject } from 'react';
import { distanciaEnLineaRecta, type PuntoMapa } from '../utils/coordenadas';
import { proyectarSobreTrazo, puntoEnDistancia } from '../utils/geometria_trazo';

/** Algo menos que el intervalo típico del GPS (3 s): el marcador llega antes del siguiente reporte. */
const DURACION_MS = 900;
/** Un salto mayor no es movimiento real (señal recuperada, corrección): se coloca sin animar. */
const SALTO_MAXIMO_M = 400;
/** Distancia a la que se considera que ambos extremos están dibujados sobre la ruta. */
const TOLERANCIA_SOBRE_RUTA_M = 1;

function suavizar(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * Desplaza el marcador hasta `objetivo` sin re-renderizar React en cada cuadro.
 * Si los dos puntos están sobre la ruta, avanza por las calles en vez de cortar en línea recta.
 * Con movimiento reducido, o ante un salto grande, se coloca directamente.
 */
export function useMovimientoMarcador(
  marcadorRef: RefObject<L.Marker | null>,
  objetivo: PuntoMapa,
  trazo?: readonly PuntoMapa[],
): void {
  // El trazo se lee en el momento de animar: una ruta nueva no debe reiniciar el movimiento.
  const trazoRef = useRef(trazo);
  useEffect(() => {
    trazoRef.current = trazo;
  });
  const { latitud, longitud } = objetivo;

  useEffect(() => {
    const marcador = marcadorRef.current;
    if (!marcador) return;
    const actual = marcador.getLatLng();
    const desde = { latitud: actual.lat, longitud: actual.lng };
    const hasta = { latitud, longitud };
    const distancia = distanciaEnLineaRecta(desde, hasta);
    if (distancia < 0.5) return;

    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reducido || distancia > SALTO_MAXIMO_M) {
      marcador.setLatLng([latitud, longitud]);
      return;
    }

    const ruta = trazoRef.current;
    const inicio = ruta ? proyectarSobreTrazo(desde, ruta) : null;
    const fin = ruta ? proyectarSobreTrazo(hasta, ruta) : null;
    const porLaRuta =
      ruta &&
      inicio &&
      fin &&
      inicio.distanciaAlTrazo <= TOLERANCIA_SOBRE_RUTA_M &&
      fin.distanciaAlTrazo <= TOLERANCIA_SOBRE_RUTA_M &&
      fin.distanciaRecorrida >= inicio.distanciaRecorrida
        ? { ruta, desde: inicio.distanciaRecorrida, hasta: fin.distanciaRecorrida }
        : null;

    let cuadro = 0;
    const comienzo = performance.now();
    const avanzar = (instante: number) => {
      const progreso = Math.min((instante - comienzo) / DURACION_MS, 1);
      const t = suavizar(progreso);
      const punto = porLaRuta
        ? puntoEnDistancia(porLaRuta.ruta, porLaRuta.desde + (porLaRuta.hasta - porLaRuta.desde) * t)
        : { latitud: desde.latitud + (latitud - desde.latitud) * t, longitud: desde.longitud + (longitud - desde.longitud) * t };
      if (punto) marcador.setLatLng([punto.latitud, punto.longitud]);
      if (progreso < 1) cuadro = requestAnimationFrame(avanzar);
    };
    cuadro = requestAnimationFrame(avanzar);
    // Si llega otra posición a mitad de camino, la siguiente animación parte desde donde quedó.
    return () => cancelAnimationFrame(cuadro);
  }, [marcadorRef, latitud, longitud]);
}
