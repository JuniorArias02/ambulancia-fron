export interface PreguntaLista {
  id: string;
  pregunta: string;
  orden: number;
  obligatorio: boolean;
  permiteObservacion: boolean;
  /** Nada se borra: las preguntas se desactivan. */
  activo: boolean;
}

/** Opción de calificación (Bien, Regular…). */
export interface OpcionLista {
  id: string;
  nombre: string;
  /** Puntaje opcional; el mayor es la mejor calificación. */
  valor: number | null;
  orden: number;
  activo: boolean;
}

export interface ListaChequeo {
  id: string;
  nombre: string;
  descripcion: string | null;
  /** Solo una lista está activa: activar una desactiva la anterior. */
  activa: boolean;
  creadaEn: string;
  actualizadaEn: string | null;
  /** Ordenadas por `orden`, con las inactivas incluidas. */
  items: PreguntaLista[];
  estados: OpcionLista[];
}

export interface FiltrosListasChequeo {
  activa?: boolean;
  busqueda?: string;
  pagina: number;
  limite: number;
}

export interface DatosPregunta {
  pregunta: string;
  orden?: number;
  obligatorio?: boolean;
  permiteObservacion?: boolean;
}

export type CambiosPregunta = Partial<DatosPregunta> & { activo?: boolean };

export interface DatosOpcion {
  nombre: string;
  valor?: number | null;
  orden?: number;
}

export type CambiosOpcion = Partial<DatosOpcion> & { activo?: boolean };

export interface DatosCrearLista {
  nombre: string;
  descripcion?: string;
  items: DatosPregunta[];
  estados: DatosOpcion[];
}

export interface DatosActualizarLista {
  nombre?: string;
  descripcion?: string;
}
