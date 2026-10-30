import type { PuntoMapa } from '../../map/utils/coordenadas';

/** Qué tanto creerle a la dirección encontrada para un punto. */
export type PrecisionUbicacion = 'exacta' | 'aproximada' | 'zona';

/** `almacenada`: reutilizada, inmediata. `proveedor`: se consultó en el momento (1 a 3 s). */
export type OrigenGeocodificacion = 'almacenada' | 'proveedor';

export interface GeocodificacionInversa {
  id: string;
  /** Es el punto que se guarda: donde el usuario marcó que está el paciente. */
  puntoSolicitado: PuntoMapa;
  direccion: string;
  /** `null` en precisión `zona`: el backend no inventa una dirección. */
  lineaDireccion: string | null;
  componentes: {
    calle: string | null;
    numero: string | null;
    barrio: string | null;
    ciudad: string | null;
    departamento: string | null;
    codigoPostal: string | null;
    pais: string | null;
  };
  precision: PrecisionUbicacion;
  distanciaMetros: number;
  coordenadasDireccion: PuntoMapa | null;
  proveedor: string;
  origen: OrigenGeocodificacion;
  geocodificadaEn: string;
}

export interface DireccionGeocodificada {
  id: string;
  direccionOriginal: string;
  direccionNormalizada: string;
  ciudad: string | null;
  direccionFormateada: string | null;
  coordenadas: PuntoMapa;
  proveedor: string;
  proveedorResultadoId: string | null;
  confianza: number | null;
  origen: OrigenGeocodificacion;
  geocodificadaEn: string;
}

export interface DatosGeocodificar {
  direccion: string;
  ciudad?: string;
}
