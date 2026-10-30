import type { PuntoMapa } from '../../map/utils/coordenadas';

export type NivelComplejidad = 'baja' | 'mediana' | 'alta';

export interface InstitucionSalud {
  id: string;
  nombre: string;
  /** Código REPS de habilitación. */
  codigoHabilitacion: string | null;
  nivelComplejidad: NivelComplejidad | null;
  telefono: string | null;
  direccion: string | null;
  coordenadas: PuntoMapa | null;
  activa: boolean;
  /** Solo al ordenar por cercanía; en línea recta. */
  distanciaMetros?: number | null;
}

export interface FiltrosInstituciones {
  busqueda?: string;
  activa?: boolean;
  nivelComplejidad?: NivelComplejidad;
  pagina: number;
  limite: number;
}

interface CamposInstitucion {
  nombre: string;
  codigoHabilitacion: string | null;
  nivelComplejidad: NivelComplejidad | null;
  telefono: string | null;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
}

/** En el registro los opcionales vacíos se omiten. */
export type DatosCrearInstitucion = Pick<CamposInstitucion, 'nombre'> &
  Partial<{ [Campo in Exclude<keyof CamposInstitucion, 'nombre'>]: NonNullable<CamposInstitucion[Campo]> }>;

/** Solo lo que cambia; `null` borra el dato. */
export type DatosActualizarInstitucion = Partial<CamposInstitucion>;
