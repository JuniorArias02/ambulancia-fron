import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { PuntoMapa } from '../utils/coordenadas';

/**
 * Encuadra el mapa para que se vean todos los puntos. Solo reencuadra cuando cambian los
 * puntos (la clave es un texto estable), no en cada render ni con cada lectura GPS.
 */
export function EncuadrarPuntos({ puntos }: { puntos: readonly PuntoMapa[] }) {
  const mapa = useMap();
  const clave = puntos.map(({ latitud, longitud }) => `${latitud.toFixed(5)},${longitud.toFixed(5)}`).join('|');

  useEffect(() => {
    if (clave === '') return;
    const limites = clave.split('|').map((par): [number, number] => {
      const [lat = 0, lng = 0] = par.split(',').map(Number);
      return [lat, lng];
    });
    mapa.fitBounds(limites, { padding: [28, 28], maxZoom: 17 });
  }, [mapa, clave]);

  return null;
}
