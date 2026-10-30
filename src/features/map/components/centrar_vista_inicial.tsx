import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface PropiedadesCentrarVistaInicial {
  centro: [number, number];
  zoom: number;
}

function leerVariablePixeles(elemento: HTMLElement, nombre: string): number {
  const valor = Number.parseFloat(getComputedStyle(elemento).getPropertyValue(nombre));
  return Number.isFinite(valor) ? valor : 0;
}

/**
 * Centra el punto inicial en la zona que no tapan el sidebar ni la barra superior,
 * usando las variables `--lienzo-izquierda` y `--lienzo-superior` del layout.
 */
export function CentrarVistaInicial({ centro, zoom }: PropiedadesCentrarVistaInicial) {
  const mapa = useMap();
  const [latitud, longitud] = centro;

  useEffect(() => {
    const contenedor = mapa.getContainer();
    const desplazamientoX = leerVariablePixeles(contenedor, '--lienzo-izquierda') / 2;
    const desplazamientoY = leerVariablePixeles(contenedor, '--lienzo-superior') / 2;
    const puntoCentral = mapa
      .project([latitud, longitud], zoom)
      .subtract([desplazamientoX, desplazamientoY]);
    mapa.setView(mapa.unproject(puntoCentral, zoom), zoom, { animate: false });
  }, [mapa, latitud, longitud, zoom]);

  return null;
}
