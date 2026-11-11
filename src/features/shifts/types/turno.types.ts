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
  /** Una persona sola forma un turno válido: no asumir que siempre hay conductor y paramédico. */
  tripulacionCompleta: boolean;
}

export interface FiltrosTurnos {
  ambulanciaId?: string;
  usuarioId?: string;
  estado?: EstadoTurno;
  pagina: number;
  limite: number;
}
