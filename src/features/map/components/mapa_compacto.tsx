import { MapPinOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { entorno } from '../../../config/entorno';
import { obtenerConfiguracionTeselas } from '../services/proveedor_teselas';
import type { PuntoMapa } from '../utils/coordenadas';
import { AjustarTamanoMapa } from './ajustar_tamano_mapa';
import { AtribucionMapa } from './atribucion_mapa';

interface PropiedadesMapaCompacto {
  /** Centro inicial; sin valor se usa el centro configurado para la operación. */
  centro: PuntoMapa | null;
  zoom?: number;
  etiqueta: string;
  /** Muestra el cursor de selección. */
  seleccionable?: boolean;
  children?: ReactNode;
}

export const ZOOM_DETALLE = 16;

/** Mapa pequeño para paneles y formularios; las capas llegan como hijos. */
export function MapaCompacto({ centro, zoom, etiqueta, seleccionable = false, children }: PropiedadesMapaCompacto) {
  const teselas = obtenerConfiguracionTeselas();

  if (!teselas) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-white/50 px-4 text-center text-[13px] text-texto-secundario">
        <MapPinOff aria-hidden strokeWidth={1.75} className="size-5" />
        Mapa no disponible: falta la clave de Geoapify.
      </div>
    );
  }

  const posicion: [number, number] = centro
    ? [centro.latitud, centro.longitud]
    : [entorno.centroMapa.latitud, entorno.centroMapa.longitud];

  return (
    <div
      role="region"
      aria-label={etiqueta}
      className={`relative isolate h-full w-full ${seleccionable ? '[&_.leaflet-container]:cursor-crosshair' : ''}`}
    >
      <MapContainer
        center={posicion}
        zoom={zoom ?? (centro ? ZOOM_DETALLE : entorno.zoomMapa)}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url={teselas.url} maxZoom={teselas.zoomMaximo} />
        <ZoomControl position="bottomright" />
        <AjustarTamanoMapa />
        {children}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-1000">
        <AtribucionMapa fuentes={teselas.atribuciones} />
      </div>
    </div>
  );
}
