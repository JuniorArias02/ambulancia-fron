export type FuncionTripulante = 'conductor' | 'paramedico' | 'medico';

export type EstadoTurno = 'activo' | 'finalizado';

export interface IntegranteTurno {
  usuarioId: string;
  nombreCompleto: string | null;
  funcion: FuncionTripulante;
}

export interface Turno {
  id: string;
  ambulanciaId: string;
  ambulanciaCodigo: string | null;
  inicio: string;
  fin: string | null;
  estado: EstadoTurno;
  integrantes: IntegranteTurno[];
}

export interface FiltrosTurnos {
  ambulanciaId?: string;
  usuarioId?: string;
  estado?: EstadoTurno;
  pagina: number;
  limite: number;
}

export interface DatosIntegrante {
  usuarioId: string;
  funcion: FuncionTripulante;
}

export interface DatosIniciarTurno {
  ambulanciaId: string;
  integrantes: DatosIntegrante[];
}

/** Persona que se puede elegir en una fila de la tripulación. */
export interface OpcionPersona {
  usuarioId: string;
  nombre: string;
  /** Motivo por el que no se puede elegir (p. ej. "en el turno de AMB-02"). */
  noDisponible?: string;
}
