import { useEffect } from 'react';
import { CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import type { PuntoMapa } from '../utils/coordenadas';
import { MapaCompacto, ZOOM_DETALLE } from './mapa_compacto';

interface PropiedadesMapaPunto {
  punto: PuntoMapa | null;
  /** Con valor, un clic en el mapa elige el punto. */
  alSeleccionar?: (punto: PuntoMapa) => void;
  /** Color del marcador (Leaflet necesita el valor literal, no una clase). */
  color?: string;
  etiqueta: string;
}

const COLOR_PREDETERMINADO = '#2563eb';

function SeleccionarConClic({ alSeleccionar }: { alSeleccionar: (punto: PuntoMapa) => void }) {
  useMapEvents({
    click: ({ latlng }) => alSeleccionar({ latitud: latlng.lat, longitud: latlng.lng }),
  });
  return null;
}

/** Lleva el punto a la vista cuando cambia fuera del mapa (p. ej. escribiendo coordenadas). */
function MantenerPuntoVisible({ punto }: { punto: PuntoMapa | null }) {
  const mapa = useMap();
  const latitud = punto?.latitud;
  const longitud = punto?.longitud;

  useEffect(() => {
    if (latitud === undefined || longitud === undefined) return;
    if (!mapa.getBounds().contains([latitud, longitud])) {
      mapa.setView([latitud, longitud], Math.max(mapa.getZoom(), ZOOM_DETALLE));
    }
  }, [mapa, latitud, longitud]);

  return null;
}

/** Mapa pequeño con un único punto, para mostrarlo o elegirlo. */
export function MapaPunto({ punto, alSeleccionar, color = COLOR_PREDETERMINADO, etiqueta }: PropiedadesMapaPunto) {
  return (
    <MapaCompacto centro={punto} etiqueta={etiqueta} seleccionable={Boolean(alSeleccionar)}>
      <MantenerPuntoVisible punto={punto} />
      {alSeleccionar && <SeleccionarConClic alSeleccionar={alSeleccionar} />}
      {punto && (
        <CircleMarker
          center={[punto.latitud, punto.longitud]}
          radius={9}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: color, fillOpacity: 1 }}
        />
      )}
    </MapaCompacto>
  );
}
