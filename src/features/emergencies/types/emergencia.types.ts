export type FuenteEmergencia = 'linea_123' | 'telefono' | 'radio' | 'app';

export type TipoIncidente =
  | 'accidente_transito'
  | 'caida'
  | 'arma'
  | 'quemadura'
  | 'clinico'
  | 'otro';

export type PrioridadEmergencia = 'roja' | 'amarilla' | 'verde';

/** Solo lectura: el estado lo cambia el backend, nunca el cliente. */
export type EstadoEmergencia = 'recibida' | 'despachada' | 'en_atencion' | 'cerrada' | 'cancelada';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface Emergencia {
  id: string;
  numeroEmergencia: string;
  fuente: FuenteEmergencia;
  informanteNombre: string | null;
  informanteTelefono: string | null;
  descripcion: string;
  tipoIncidente: TipoIncidente | null;
  prioridad: PrioridadEmergencia | null;
  direccion: string | null;
  referenciaLugar: string | null;
  coordenadas: Coordenadas | null;
  numeroVictimas: number | null;
  estado: EstadoEmergencia;
  /** Con valor, es una llamada repetida de esa emergencia. */
  emergenciaPrincipalId: string | null;
  recibidaPor: { id: string; nombreCompleto: string | null } | null;
  recibidaEn: string;
  cerradaEn: string | null;
}

export type CriterioDuplicado = 'cercania' | 'misma_direccion' | 'mismo_tipo';

export interface PosibleDuplicada {
  emergencia: Emergencia;
  distanciaMetros: number | null;
  criterios: CriterioDuplicado[];
}

export interface FiltrosEmergencias {
  busqueda?: string;
  estado?: EstadoEmergencia;
  soloActivas?: boolean;
  prioridad?: PrioridadEmergencia;
  tipoIncidente?: TipoIncidente;
  /** Día local `AAAA-MM-DD`; el servicio lo convierte al rango ISO que espera la API. */
  desde?: string;
  hasta?: string;
  pagina: number;
  limite: number;
}

interface CamposEmergencia {
  fuente: FuenteEmergencia;
  descripcion: string;
  informanteNombre: string | null;
  informanteTelefono: string | null;
  tipoIncidente: TipoIncidente | null;
  prioridad: PrioridadEmergencia | null;
  direccion: string | null;
  referenciaLugar: string | null;
  latitud: number | null;
  longitud: number | null;
  numeroVictimas: number | null;
}

/** En el registro los opcionales vacíos se omiten. */
export type DatosCrearEmergencia = Pick<CamposEmergencia, 'fuente' | 'descripcion'> &
  Partial<{ [Campo in Exclude<keyof CamposEmergencia, 'fuente' | 'descripcion'>]: NonNullable<CamposEmergencia[Campo]> }>;

/** Solo lo que cambia; `null` borra el dato. */
export type DatosActualizarEmergencia = Partial<CamposEmergencia>;
