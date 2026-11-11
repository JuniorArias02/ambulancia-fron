export type EstadoChequeo = 'borrador' | 'finalizado';

export interface RespuestaChequeo {
  itemId: string;
  /** Solo en el detalle; en la lista llega `null`. */
  pregunta: string | null;
  estadoId: string;
  /** Nombre de la opción elegida. Solo en el detalle. */
  calificacion: string | null;
  tieneObservacion: boolean;
  observacion: string | null;
  respondidoEn: string;
}

export interface ChequeoDiario {
  id: string;
  /** `AAAA-MM-DD`. */
  fecha: string;
  estado: EstadoChequeo;
  iniciadoEn: string | null;
  finalizadoEn: string | null;
  listaChequeoId: string;
  ambulanciaId: string;
  ambulanciaCodigo: string | null;
  conductorId: string;
  conductorNombre: string | null;
  respuestas: RespuestaChequeo[];
  /** Ids de preguntas obligatorias sin responder (solo en el detalle). */
  pendientes: string[];
}

export interface FiltrosChequeos {
  conductorId?: string;
  ambulanciaId?: string;
  estado?: EstadoChequeo;
  /** `AAAA-MM-DD`. */
  desde?: string;
  hasta?: string;
  pagina: number;
  limite: number;
}
