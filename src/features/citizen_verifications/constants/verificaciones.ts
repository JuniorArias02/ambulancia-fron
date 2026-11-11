import type {
  DecisionVerificacion,
  EstadoVerificacion,
  FiltrosVerificaciones,
  LadoDocumento,
  TipoDocumento,
} from '../types/verificacion.types';

export const LIMITE_POR_PAGINA = 20;
export const LONGITUD_MAXIMA_BUSQUEDA = 100;
export const LONGITUD_MAXIMA_MOTIVO = 500;
export const LONGITUD_MAXIMA_OBSERVACIONES = 2000;
/** El contador del menú se refresca con poca frecuencia: solo orienta. */
export const INTERVALO_CONTADOR_MS = 60_000;

export const ESTADOS_VERIFICACION = [
  'pendiente',
  'en_revision',
  'requiere_correccion',
  'verificado',
  'rechazado',
] as const satisfies readonly EstadoVerificacion[];

export const ETIQUETAS_ESTADO_VERIFICACION: Record<EstadoVerificacion, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  requiere_correccion: 'Corrección pedida',
  verificado: 'Verificado',
  rechazado: 'Rechazado',
};

/** Texto de las pestañas de la fila. */
export const ETIQUETAS_FILTRO_ESTADO: Record<EstadoVerificacion, string> = {
  pendiente: 'Pendientes',
  en_revision: 'En revisión',
  requiere_correccion: 'Corrección pedida',
  verificado: 'Verificados',
  rechazado: 'Rechazados',
};

/** Pestaña con la que abre la fila. */
export const ESTADO_POR_DEFECTO: EstadoVerificacion = 'pendiente';

/** Transiciones que acepta el backend; los demás estados esperan al ciudadano o son finales. */
export const DECISIONES_POR_ESTADO: Record<EstadoVerificacion, readonly DecisionVerificacion[]> = {
  pendiente: ['en_revision', 'verificado', 'rechazado', 'requiere_correccion'],
  en_revision: ['verificado', 'rechazado', 'requiere_correccion'],
  requiere_correccion: [],
  verificado: [],
  rechazado: [],
};

export const ETIQUETAS_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  PPT: 'Permiso por protección temporal',
  PEP: 'Permiso especial de permanencia',
  PA: 'Pasaporte',
};

export const LADOS_DOCUMENTO = ['frontal', 'posterior'] as const satisfies readonly LadoDocumento[];

export const ETIQUETAS_LADO: Record<LadoDocumento, string> = {
  frontal: 'Cara frontal',
  posterior: 'Cara posterior',
};

/** Rellenan el motivo; el administrador puede editarlos antes de enviar. */
export const MOTIVOS_PREDEFINIDOS = [
  'La foto frontal está borrosa o cortada; tómela de nuevo completa y con buena luz.',
  'La foto posterior está borrosa o cortada; tómela de nuevo completa y con buena luz.',
  'El número de documento no coincide con el de la foto.',
  'El nombre no coincide con el del documento.',
  'La fecha de nacimiento no coincide con la del documento.',
] as const;

export const CLAVES_VERIFICACIONES = {
  todas: ['verificaciones-ciudadanos'] as const,
  listas: ['verificaciones-ciudadanos', 'lista'] as const,
  lista: (filtros: FiltrosVerificaciones) => ['verificaciones-ciudadanos', 'lista', filtros] as const,
  pendientes: ['verificaciones-ciudadanos', 'pendientes'] as const,
  detalle: (usuarioId: string) => ['verificaciones-ciudadanos', 'detalle', usuarioId] as const,
};
