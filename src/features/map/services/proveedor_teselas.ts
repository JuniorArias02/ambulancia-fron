import { entorno } from '../../../config/entorno';

export interface FuenteAtribucion {
  texto: string;
  url: string;
}

export interface ConfiguracionTeselas {
  url: string;
  atribuciones: FuenteAtribucion[];
  zoomMaximo: number;
}

// Adaptador del proveedor cartográfico: cambiar de proveedor solo afecta este archivo.
// Las atribuciones son obligatorias según las licencias de los datos y del proveedor.
export function obtenerConfiguracionTeselas(): ConfiguracionTeselas | null {
  if (!entorno.claveGeoapify) return null;

  const clave = encodeURIComponent(entorno.claveGeoapify);
  return {
    url: `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}{r}.png?apiKey=${clave}`,
    atribuciones: [
      { texto: 'Geoapify', url: 'https://www.geoapify.com/' },
      { texto: '© OpenMapTiles', url: 'https://openmaptiles.org/' },
      { texto: '© OpenStreetMap', url: 'https://www.openstreetmap.org/copyright' },
    ],
    zoomMaximo: 20,
  };
}
