export type EstadoVerificacion = 'pendiente' | 'en_revision' | 'verificado' | 'rechazado' | 'requiere_correccion';

export type DecisionVerificacion = Exclude<EstadoVerificacion, 'pendiente'>;

export type TipoDocumento = 'CC' | 'CE' | 'PPT' | 'PEP' | 'PA';

export type LadoDocumento = 'frontal' | 'posterior';

export interface VerificacionResumen {
  usuarioId: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  /** Solo dígitos o caracteres del documento, sin puntos ni espacios. */
  numeroDocumento: string;
  correo: string;
  telefono: string;
  estado: EstadoVerificacion;
  enviadaEn: string;
  revisadaEn: string | null;
}

export interface Responsable {
  id: string;
  nombreCompleto: string | null;
}

export interface DocumentoVerificacion {
  id: string;
  lado: LadoDocumento;
  tipoMime: string;
  tamanoBytes: number;
  cargadoEn: string;
}

export interface CambioVerificacion {
  estadoAnterior: EstadoVerificacion | null;
  estadoNuevo: EstadoVerificacion;
  /** Lo lee el ciudadano en la app. */
  motivo: string | null;
  /** Nota interna; el ciudadano nunca la ve. */
  observaciones: string | null;
  responsable: Responsable;
  ocurridoEn: string;
}

export interface VerificacionDetalle extends VerificacionResumen {
  /** `AAAA-MM-DD`. */
  fechaNacimiento: string;
  estadoCuenta: 'activo' | 'inactivo' | 'bloqueado';
  registradoEn: string;
  motivo: string | null;
  revisadaPor: Responsable | null;
  /** Fotos vigentes; el orden no está garantizado. */
  documentos: DocumentoVerificacion[];
  /** Del más antiguo al más reciente. */
  historial: CambioVerificacion[];
}

export interface FiltrosVerificaciones {
  /** Sin valor, todas. */
  estado?: EstadoVerificacion;
  busqueda?: string;
  pagina: number;
  limite: number;
}

export interface DatosDecision {
  decision: DecisionVerificacion;
  motivo?: string;
  observaciones?: string;
}
