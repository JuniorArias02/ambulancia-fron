import type {
  CampoFecha,
  Desenlace,
  EstadoFiltroHistoria,
  EstadoHistoria,
  OrdenHistorias,
  RegimenAfiliacion,
  RolVictima,
  Sexo,
  TipoAccionHistoria,
  TipoDocumento,
  TipoEvento,
  Triage,
} from '../types/historia_clinica.types';

export const LIMITES_PAGINA = [20, 50, 100] as const;
export const LIMITE_POR_DEFECTO = 20;
export const LIMITE_TRAZABILIDAD = 100;
/** Espera antes de buscar tras cambiar un select. */
export const RETRASO_FILTROS_MS = 300;
export const LONGITUD_MAXIMA_MOTIVO_ANULACION = 255;
export const DIAS_MAXIMOS_RANGO = 366;
/** Filas máximas de una exportación a Excel; con más, el backend responde 422. */
export const MAXIMO_EXPORTACION = 5000;

export const ETIQUETAS_ESTADO_HISTORIA: Record<EstadoHistoria, string> = {
  borrador: 'En curso',
  cerrada: 'Cerrada',
  anulada: 'Anulada',
};

export const ESTADOS_FILTRO: readonly { valor: EstadoFiltroHistoria; texto: string }[] = [
  { valor: 'vigentes', texto: 'Vigentes' },
  { valor: 'borrador', texto: 'En curso' },
  { valor: 'cerrada', texto: 'Cerradas' },
  { valor: 'anulada', texto: 'Anuladas' },
  { valor: 'todos', texto: 'Todas' },
];

export const TRIAGES = ['rojo', 'amarillo', 'verde', 'negro'] as const satisfies readonly Triage[];

/** Colores clínicos del triage: los mismos que usa la app. */
export const TRIAGE: Record<Triage, { etiqueta: string; corta: string; color: string }> = {
  rojo: { etiqueta: 'Rojo: crítico', corta: 'Rojo', color: '#D32F2F' },
  amarillo: { etiqueta: 'Amarillo: urgente', corta: 'Amarillo', color: '#F9A825' },
  verde: { etiqueta: 'Verde: no urgente', corta: 'Verde', color: '#2E7D32' },
  negro: { etiqueta: 'Negro: fallecido o sin posibilidad', corta: 'Negro', color: '#212121' },
};

export const DESENLACES = [
  'trasladado',
  'rechazo_traslado',
  'atendido_en_sitio',
  'fallecido_en_sitio',
] as const satisfies readonly Desenlace[];

export const ETIQUETAS_DESENLACE: Record<Desenlace, string> = {
  trasladado: 'Trasladado',
  rechazo_traslado: 'Rechazó el traslado',
  atendido_en_sitio: 'Atendido en el sitio',
  fallecido_en_sitio: 'Falleció en el sitio',
};

export const TIPOS_EVENTO = [
  'transito',
  'caida',
  'arma_fuego',
  'arma_blanca',
  'quemadura',
  'clinico',
  'otro',
] as const satisfies readonly TipoEvento[];

export const ETIQUETAS_TIPO_EVENTO: Record<TipoEvento, string> = {
  transito: 'Accidente de tránsito',
  caida: 'Caída',
  arma_fuego: 'Arma de fuego',
  arma_blanca: 'Arma blanca',
  quemadura: 'Quemadura',
  clinico: 'Clínico',
  otro: 'Otro',
};

export const ETIQUETAS_ROL_VICTIMA: Record<RolVictima, string> = {
  conductor: 'Conductor',
  pasajero: 'Pasajero',
  peaton: 'Peatón',
  motociclista: 'Motociclista',
  ciclista: 'Ciclista',
};

export const REGIMENES = [
  'contributivo',
  'subsidiado',
  'especial_excepcion',
  'no_afiliado',
] as const satisfies readonly RegimenAfiliacion[];

export const ETIQUETAS_REGIMEN: Record<RegimenAfiliacion, string> = {
  contributivo: 'Contributivo',
  subsidiado: 'Subsidiado',
  especial_excepcion: 'Especial o de excepción',
  no_afiliado: 'No afiliado',
};

export const ETIQUETAS_SEXO: Record<Sexo, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  indeterminado: 'Indeterminado',
};

export const ETIQUETAS_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  CC: 'Cédula de ciudadanía',
  TI: 'Tarjeta de identidad',
  RC: 'Registro civil',
  CE: 'Cédula de extranjería',
  PA: 'Pasaporte',
  PEP: 'Permiso especial de permanencia',
  PPT: 'Permiso por protección temporal',
  AS: 'Adulto sin identificación',
  MS: 'Menor sin identificación',
};

export const CAMPOS_FECHA: readonly { valor: CampoFecha; texto: string }[] = [
  { valor: 'atencion', texto: 'Atención' },
  { valor: 'evento', texto: 'Evento' },
  { valor: 'cierre', texto: 'Cierre' },
];

export const ORDENES = ['fecha_desc', 'fecha_asc', 'numero', 'paciente'] as const satisfies readonly OrdenHistorias[];

export const ETIQUETAS_REGION: Record<string, string> = {
  cabeza: 'Cabeza',
  cara: 'Cara',
  cuello: 'Cuello',
  torax: 'Tórax',
  abdomen: 'Abdomen',
  espalda: 'Espalda',
  pelvis: 'Pelvis',
  miembro_superior_derecho: 'Miembro superior derecho',
  miembro_superior_izquierdo: 'Miembro superior izquierdo',
  miembro_inferior_derecho: 'Miembro inferior derecho',
  miembro_inferior_izquierdo: 'Miembro inferior izquierdo',
  generalizada: 'Generalizada',
};

export const ETIQUETAS_TIPO_LESION: Record<string, string> = {
  herida: 'Herida',
  fractura: 'Fractura',
  quemadura: 'Quemadura',
  amputacion: 'Amputación',
  contusion: 'Contusión',
  luxacion: 'Luxación',
  trauma_cerrado: 'Trauma cerrado',
  otra: 'Otra',
};

/** Ítems de la escala J.H. Downton, en el orden en que se valoran. */
export const ITEMS_DOWNTON = [
  { clave: 'caidasPrevias', etiqueta: 'Caídas previas' },
  { clave: 'medTranquilizantesSedantes', etiqueta: 'Tranquilizantes o sedantes' },
  { clave: 'medDiureticos', etiqueta: 'Diuréticos' },
  { clave: 'medHipotensores', etiqueta: 'Hipotensores (no diuréticos)' },
  { clave: 'medAntiparkinsonianos', etiqueta: 'Antiparkinsonianos' },
  { clave: 'medAntidepresivos', etiqueta: 'Antidepresivos' },
  { clave: 'medOtros', etiqueta: 'Otros medicamentos' },
  { clave: 'deficitVisual', etiqueta: 'Déficit visual' },
  { clave: 'deficitAuditivo', etiqueta: 'Déficit auditivo' },
  { clave: 'deficitExtremidades', etiqueta: 'Déficit en extremidades' },
] as const;

export const PUNTAJE_MAXIMO_DOWNTON = 12;

export const ETIQUETAS_ESTADO_MENTAL: Record<string, string> = { orientado: 'Orientado', confuso: 'Confuso' };

export const ETIQUETAS_DEAMBULACION: Record<string, string> = {
  normal: 'Normal',
  segura_con_ayuda: 'Segura con ayuda',
  insegura: 'Insegura (con o sin ayuda)',
  imposible: 'Imposible',
};

// --- Ingreso -----------------------------------------------------------------

export const ETIQUETAS_FUENTE: Record<string, string> = {
  linea_123: 'Línea 123',
  telefono: 'Teléfono',
  radio: 'Radio',
  app: 'App ciudadana',
};

export const PRIORIDADES: Record<string, { etiqueta: string; color: string }> = {
  roja: { etiqueta: 'Roja', color: TRIAGE.rojo.color },
  amarilla: { etiqueta: 'Amarilla', color: TRIAGE.amarillo.color },
  verde: { etiqueta: 'Verde', color: TRIAGE.verde.color },
};

export const ETIQUETAS_TIPO_INCIDENTE: Record<string, string> = {
  accidente_transito: 'Accidente de tránsito',
  caida: 'Caída',
  arma: 'Arma',
  quemadura: 'Quemadura',
  clinico: 'Clínico',
  otro: 'Otro',
};

export const ETIQUETAS_ESTADO_EMERGENCIA: Record<string, string> = {
  recibida: 'Recibida',
  despachada: 'Despachada',
  en_atencion: 'En atención',
  cerrada: 'Cerrada',
  cancelada: 'Cancelada',
};

export const ETIQUETAS_ESTADO_ASIGNACION: Record<string, string> = {
  asignada: 'Asignada',
  en_camino: 'En camino',
  en_escena: 'En la escena',
  atendiendo: 'Atendiendo',
  trasladando: 'Trasladando',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export const ETIQUETAS_FUNCION: Record<string, string> = {
  conductor: 'Conductor',
  paramedico: 'Paramédico',
  medico: 'Médico',
};

export const ETIQUETAS_TIPO_AMBULANCIA: Record<string, string> = {
  TAB: 'Transporte asistencial básico',
  TAM: 'Transporte asistencial medicalizado',
};

export const ETIQUETAS_TIPO_MOVIMIENTO: Record<string, string> = {
  consumo: 'Consumo',
  devolucion: 'Devolución',
  transferencia: 'Transferencia',
  entrada: 'Entrada',
  ajuste: 'Ajuste',
  baja: 'Baja',
};

export const ETIQUETAS_ESTADO_MOVIMIENTO: Record<string, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  anulado: 'Anulado',
};

export const ETIQUETAS_ORIGEN_UBICACION: Record<string, string> = { gps: 'GPS', manual: 'Manual' };

// --- Trazabilidad ------------------------------------------------------------

export const ETIQUETAS_TIPO_ACCION: Record<TipoAccionHistoria, string> = {
  creacion: 'Creación',
  modificacion: 'Modificación',
  firma: 'Firma',
  anulacion: 'Anulación',
  consulta: 'Consulta',
};

/** Nombres legibles de los campos que la trazabilidad dice que cambiaron. */
export const ETIQUETAS_CAMPO: Record<string, string> = {
  triage: 'Triage',
  desenlace: 'Desenlace',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  numeroDocumento: 'Documento',
  tipoDocumento: 'Tipo de documento',
  aseguradoraEps: 'EPS',
  regimenAfiliacion: 'Régimen',
  institucionDestinoId: 'Institución de destino',
  receptorNombre: 'Receptor',
  motivoRechazo: 'Motivo del rechazo',
  impresionDiagnostica: 'Impresión diagnóstica',
  observaciones: 'Observaciones',
  alergias: 'Alergias',
};

/** Lo que falta para cerrar una historia en curso, con nombres legibles. */
export const ETIQUETAS_FALTANTE: Record<string, string> = {
  ...ETIQUETAS_CAMPO,
  signosVitales: 'Signos vitales',
  tipoEvento: 'Tipo de evento',
};

// --- Firmas de la historia ---------------------------------------------------

export const PROPOSITOS_FIRMA = ['comprobante_atencion', 'disentimiento', 'entrega'] as const;

export const ETIQUETAS_PROPOSITO_FIRMA: Record<(typeof PROPOSITOS_FIRMA)[number], string> = {
  comprobante_atencion: 'Comprobante de atención',
  disentimiento: 'Disentimiento',
  entrega: 'Entrega',
};

export const ETIQUETAS_ROL_FIRMANTE: Record<string, string> = {
  paciente: 'Paciente',
  acudiente: 'Familiar',
  testigo: 'Testigo',
  receptor: 'Quien recibe',
};

export const ETIQUETAS_MOTIVO_SIN_FIRMA: Record<string, string> = {
  inconsciente_sin_acudiente: 'Inconsciente y sin familiar',
  fallecido: 'Fallecido',
  se_nego: 'Se negó a firmar',
  otro: 'Otro',
};

export const ETIQUETAS_PARENTESCO: Record<string, string> = {
  padre: 'Padre',
  madre: 'Madre',
  hijo: 'Hijo o hija',
  conyuge_companero: 'Cónyuge o compañero',
  hermano: 'Hermano o hermana',
  abuelo: 'Abuelo o abuela',
  nieto: 'Nieto o nieta',
  tio: 'Tío o tía',
  sobrino: 'Sobrino o sobrina',
  primo: 'Primo o prima',
  otro_familiar: 'Otro familiar',
};
