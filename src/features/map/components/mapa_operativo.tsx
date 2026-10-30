import type { ReactNode } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { EstadoError } from '../../../components/states/estado_error';
import { entorno } from '../../../config/entorno';
import { obtenerConfiguracionTeselas } from '../services/proveedor_teselas';
import { AjustarTamanoMapa } from './ajustar_tamano_mapa';
import { AtribucionMapa } from './atribucion_mapa';
import { CentrarVistaInicial } from './centrar_vista_inicial';

interface PropiedadesMapaOperativo {
  children?: ReactNode;
}

export function MapaOperativo({ children }: PropiedadesMapaOperativo) {
  const teselas = obtenerConfiguracionTeselas();
  const centro: [number, number] = [entorno.centroMapa.latitud, entorno.centroMapa.longitud];

  if (!teselas) {
    return (
      <div className="flex h-full items-center justify-center bg-white/40">
        <EstadoError
          titulo="Mapa no configurado"
          mensaje="Falta la clave de Geoapify (VITE_GEOAPIFY_API_KEY) en las variables de entorno."
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={centro}
        zoom={entorno.zoomMapa}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url={teselas.url} maxZoom={teselas.zoomMaximo} />
        <ZoomControl position="bottomright" />
        <AjustarTamanoMapa />
        <CentrarVistaInicial centro={centro} zoom={entorno.zoomMapa} />
        {children}
      </MapContainer>
      <div className="absolute right-16 bottom-3 z-1000">
        <AtribucionMapa fuentes={teselas.atribuciones} />
      </div>
    </div>
  );
}
