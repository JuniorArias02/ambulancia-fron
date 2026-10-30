import { api } from '../../../services/api';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import type {
  DatosGeocodificar,
  DireccionGeocodificada,
  GeocodificacionInversa,
} from '../types/geocodificacion.types';

/** La clave del proveedor vive solo en el backend: el navegador nunca consulta a Geoapify. */
export async function geocodificarDireccion(datos: DatosGeocodificar): Promise<DireccionGeocodificada> {
  const { data } = await api.post<DireccionGeocodificada>('/geocodificacion', datos);
  return data;
}

export async function geocodificarPunto(punto: PuntoMapa): Promise<GeocodificacionInversa> {
  const { data } = await api.post<GeocodificacionInversa>('/geocodificacion/inversa', punto);
  return data;
}
