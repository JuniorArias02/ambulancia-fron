import type {
  CriterioDuplicado,
  EstadoEmergencia,
  FuenteEmergencia,
  OrigenUbicacion,
  PrioridadEmergencia,
  TipoIncidente,
} from '../types/emergencia.types';

export const FUENTES = ['linea_123', 'telefono', 'radio', 'app'] as const satisfies readonly FuenteEmergencia[];

export const TIPOS_INCIDENTE = [
  'accidente_transito',
  'caida',
  'arma',
  'quemadura',
  'clinico',
  'otro',
] as const satisfies readonly TipoIncidente[];

export const PRIORIDADES = ['roja', 'amarilla', 'verde'] as const satisfies readonly PrioridadEmergencia[];

export const ESTADOS_EMERGENCIA = [
  'recibida',
  'despachada',
  'en_atencion',
  'cerrada',
  'cancelada',
] as const satisfies readonly EstadoEmergencia[];

export const ESTADOS_ACTIVOS: readonly EstadoEmergencia[] = ['recibida', 'despachada', 'en_atencion'];

export const ETIQUETAS_FUENTE: Record<FuenteEmergencia, string> = {
  linea_123: 'Línea 123',
  telefono: 'Teléfono',
  radio: 'Radio',
  app: 'Aplicación',
};

export const ETIQUETAS_ORIGEN_UBICACION: Record<OrigenUbicacion, string> = {
  gps: 'Ubicación por GPS',
  manual: 'Ubicación marcada a mano',
};

export const ETIQUETAS_TIPO_INCIDENTE: Record<TipoIncidente, string> = {
  accidente_transito: 'Accidente de tránsito',
  caida: 'Caída',
  arma: 'Herida por arma',
  quemadura: 'Quemadura',
  clinico: 'Caso clínico',
  otro: 'Otro',
};

export const ETIQUETAS_PRIORIDAD: Record<PrioridadEmergencia, string> = {
  roja: 'Roja',
  amarilla: 'Amarilla',
  verde: 'Verde',
};

export const DESCRIPCIONES_PRIORIDAD: Record<PrioridadEmergencia, string> = {
  roja: 'Crítica',
  amarilla: 'Urgente',
  verde: 'No urgente',
};

export const ETIQUETAS_ESTADO_EMERGENCIA: Record<EstadoEmergencia, string> = {
  recibida: 'Recibida',
  despachada: 'Despachada',
  en_atencion: 'En atención',
  cerrada: 'Cerrada',
  cancelada: 'Cancelada',
};

export const ETIQUETAS_CRITERIO: Record<CriterioDuplicado, string> = {
  cercania: 'cerca',
  misma_direccion: 'misma dirección',
  mismo_tipo: 'mismo tipo',
};

export function esActiva(estado: EstadoEmergencia): boolean {
  return ESTADOS_ACTIVOS.includes(estado);
}
