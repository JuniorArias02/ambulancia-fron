export type EstadoAsignacion =
  | 'asignada'
  | 'en_camino'
  | 'en_escena'
  | 'atendiendo'
  | 'trasladando'
  | 'finalizada'
  | 'cancelada';

/** Estados a los que se avanza con `PATCH /asignaciones/{id}/avance`. */
export type EstadoAvance = Exclude<EstadoAsignacion, 'asignada' | 'cancelada'>;

export interface Asignacion {
  id: string;
  emergenciaId: string;
  numeroEmergencia: string | null;
  ambulanciaId: string;
  ambulanciaCodigo: string | null;
  turnoId: string | null;
  estado: EstadoAsignacion;
  /** Avances permitidos ahora: son los botones a mostrar. */
  siguientesEstados: EstadoAvance[];
  motivoCancelacion: string | null;
  asignadaPor: { id: string; nombreCompleto: string | null } | null;
  asignadaEn: string;
  salidaEn: string | null;
  llegadaEscenaEn: string | null;
  /** Inicio de la atención al paciente en la escena. */
  atencionInicioEn: string | null;
  salidaEscenaEn: string | null;
  llegadaDestinoEn: string | null;
  finalizadaEn: string | null;
}

export interface FiltrosAsignaciones {
  emergenciaId?: string;
  ambulanciaId?: string;
  estado?: EstadoAsignacion;
  soloActivas?: boolean;
  pagina: number;
  limite: number;
}

export interface PuntoRecorrido {
  id: string;
  ambulanciaId: string;
  asignacionId: string | null;
  latitud: number;
  longitud: number;
  velocidad: number | null;
  registradaEn: string;
}

/** Paso de la bitácora del servicio (`GET /asignaciones/{id}/eventos`), con quién lo marcó. */
export interface EventoAsignacion {
  id: string;
  estadoAnterior: EstadoAsignacion | null;
  estadoNuevo: EstadoAsignacion;
  ocurridoEn: string;
  responsable: { id: string; nombreCompleto: string | null; rol: string | null } | null;
  posicion: { latitud: number; longitud: number } | null;
  precisionMetros: number | null;
  /** Al marcar la llegada: distancia entre el GPS del conductor y la emergencia. */
  distanciaEscenaMetros: number | null;
  /** La llegada se marcó lejos de la emergencia; `observacion` trae el motivo del conductor. */
  fueraDeRadio: boolean;
  observacion: string | null;
}
