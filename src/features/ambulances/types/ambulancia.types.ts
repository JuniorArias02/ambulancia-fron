export type EstadoOperativo = 'disponible' | 'en_servicio' | 'fuera_servicio' | 'mantenimiento';

/** `en_servicio` lo asigna el sistema al despachar; nunca se elige a mano. */
export type EstadoManual = Exclude<EstadoOperativo, 'en_servicio'>;

export interface TipoAmbulancia {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface UbicacionAmbulancia {
  latitud: number;
  longitud: number;
  registradaEn: string;
}

export interface Ambulancia {
  id: string;
  codigo: string;
  placa: string;
  tipo: TipoAmbulancia;
  estadoOperativo: EstadoOperativo;
  ultimaUbicacion: UbicacionAmbulancia | null;
  creadaEn: string;
}

export interface CambioEstado {
  id: string;
  estadoAnterior: EstadoOperativo | null;
  estadoNuevo: EstadoOperativo;
  motivo: string | null;
  usuarioId: string | null;
  cambiadoEn: string;
}

export interface FiltrosAmbulancias {
  busqueda?: string;
  estadoOperativo?: EstadoOperativo;
  tipoAmbulanciaId?: string;
  pagina: number;
  limite: number;
}

export interface DatosCrearAmbulancia {
  codigo: string;
  placa: string;
  tipoAmbulanciaId: string;
}

export type DatosActualizarAmbulancia = Partial<DatosCrearAmbulancia>;

export interface DatosCambioEstadoAmbulancia {
  estado: EstadoManual;
  motivo: string;
}
