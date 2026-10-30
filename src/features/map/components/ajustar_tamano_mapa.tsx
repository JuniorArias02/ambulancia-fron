import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/** Leaflet solo detecta cambios de la ventana; esto cubre el sidebar y la pantalla completa. */
export function AjustarTamanoMapa() {
  const mapa = useMap();

  useEffect(() => {
    const observador = new ResizeObserver(() => mapa.invalidateSize());
    observador.observe(mapa.getContainer());
    return () => observador.disconnect();
  }, [mapa]);

  return null;
}
