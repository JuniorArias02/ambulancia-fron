import type {
  ControlInsumo,
  EstadoConteo,
  EstadoDotacion,
  EstadoEquipo,
  EstadoMovimiento,
  EstadoRegistroSanitario,
  EstadoVerificacionInventario,
  TipoInsumo,
  TipoMantenimiento,
  TipoMovimiento,
  TipoRegistroSanitario,
  TipoUbicacion,
  TipoVerificacion,
} from '../types/inventario.types';

export const LIMITE_POR_PAGINA = 20;
/** Máximo que acepta la API por página; se usa para cargar catálogos completos. */
export const LIMITE_MAXIMO = 100;
export const MAXIMO_LINEAS = 200;
/** Sin tiempo real en inventario: el resumen se refresca con este intervalo. */
export const INTERVALO_RESUMEN_MS = 60_000;

export const TIPOS_INSUMO = [
  'medicamento',
  'dispositivo_medico',
  'insumo_asistencial',
  'equipo_biomedico',
  'oxigeno_medicinal',
  'otro',
] as const satisfies readonly TipoInsumo[];

export const ETIQUETAS_TIPO_INSUMO: Record<TipoInsumo, string> = {
  medicamento: 'Medicamento',
  dispositivo_medico: 'Dispositivo médico',
  insumo_asistencial: 'Insumo asistencial',
  equipo_biomedico: 'Equipo biomédico',
  oxigeno_medicinal: 'Oxígeno medicinal',
  otro: 'Otro',
};

export const CONTROLES_INSUMO = ['lote', 'serie', 'insumo'] as const satisfies readonly ControlInsumo[];

export const ETIQUETAS_CONTROL: Record<ControlInsumo, { titulo: string; descripcion: string }> = {
  lote: {
    titulo: 'Por lote',
    descripcion:
      'Cada entrada y salida indica el lote. Elígelo si necesitas saber qué lote está en cada ambulancia o controlar el vencimiento: medicamentos, soluciones, gasas estériles…',
  },
  serie: {
    titulo: 'Por serie',
    descripcion: 'Cada unidad tiene su número de serie y se mueve de a una: monitores, desfibriladores, bombas de infusión…',
  },
  insumo: {
    titulo: 'Sin lote ni serie',
    descripcion: 'Solo se cuenta la cantidad, sin lote ni vencimiento. Para lo que no necesitas rastrear, aunque venga con lote de fábrica.',
  },
};

export const TIPOS_REGISTRO = [
  'registro_sanitario',
  'permiso_comercializacion',
  'notificacion_sanitaria',
  'otro',
] as const satisfies readonly TipoRegistroSanitario[];

export const ETIQUETAS_TIPO_REGISTRO: Record<TipoRegistroSanitario, string> = {
  registro_sanitario: 'Registro sanitario',
  permiso_comercializacion: 'Permiso de comercialización',
  notificacion_sanitaria: 'Notificación sanitaria',
  otro: 'Otro',
};

export const ESTADOS_REGISTRO = ['vigente', 'vencido', 'suspendido', 'cancelado'] as const satisfies readonly EstadoRegistroSanitario[];

export const ETIQUETAS_ESTADO_REGISTRO: Record<EstadoRegistroSanitario, string> = {
  vigente: 'Vigente',
  vencido: 'Vencido',
  suspendido: 'Suspendido',
  cancelado: 'Cancelado',
};

export const ESTADOS_EQUIPO = ['operativo', 'mantenimiento', 'fuera_servicio', 'baja'] as const satisfies readonly EstadoEquipo[];

export const ETIQUETAS_ESTADO_EQUIPO: Record<EstadoEquipo, string> = {
  operativo: 'Operativo',
  mantenimiento: 'En mantenimiento',
  fuera_servicio: 'Fuera de servicio',
  baja: 'De baja',
};

export const TIPOS_MANTENIMIENTO = ['preventivo', 'correctivo', 'calibracion'] as const satisfies readonly TipoMantenimiento[];

export const ETIQUETAS_TIPO_MANTENIMIENTO: Record<TipoMantenimiento, string> = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
  calibracion: 'Calibración',
};

export const TIPOS_MOVIMIENTO = [
  'entrada',
  'transferencia',
  'ajuste',
  'baja',
  'devolucion',
  'consumo',
] as const satisfies readonly TipoMovimiento[];

export const ETIQUETAS_TIPO_MOVIMIENTO: Record<TipoMovimiento, string> = {
  entrada: 'Entrada',
  transferencia: 'Transferencia',
  consumo: 'Consumo',
  devolucion: 'Devolución',
  ajuste: 'Ajuste',
  baja: 'Baja',
};

export const DESCRIPCIONES_TIPO_MOVIMIENTO: Record<TipoMovimiento, string> = {
  entrada: 'Compra o donación que llega a una bodega.',
  transferencia: 'De una ubicación a otra, p. ej. abastecer una ambulancia.',
  consumo: 'Lo que se usó en una ambulancia. Normalmente lo registra el paramédico.',
  devolucion: 'De una ambulancia a una bodega. La bodega la confirma al recibir.',
  ajuste: 'Corrige una existencia hacia arriba o hacia abajo.',
  baja: 'Vencidos o dañados que salen del inventario.',
};

export const ESTADOS_MOVIMIENTO = ['borrador', 'confirmado', 'anulado'] as const satisfies readonly EstadoMovimiento[];

export const ETIQUETAS_ESTADO_MOVIMIENTO: Record<EstadoMovimiento, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  anulado: 'Anulado',
};

export const TIPOS_UBICACION = ['bodega', 'ambulancia'] as const satisfies readonly TipoUbicacion[];

export const ETIQUETAS_TIPO_UBICACION: Record<TipoUbicacion, string> = {
  bodega: 'Bodega',
  ambulancia: 'Ambulancia',
};

export const ETIQUETAS_ESTADO_DOTACION: Record<EstadoDotacion, string> = {
  completo: 'Completo',
  incompleto: 'Incompleto',
  bajo_minimo: 'Bajo el mínimo',
};

export const TIPOS_VERIFICACION = ['inicio_turno', 'fin_turno', 'extraordinaria'] as const satisfies readonly TipoVerificacion[];

export const ETIQUETAS_TIPO_VERIFICACION: Record<TipoVerificacion, string> = {
  inicio_turno: 'Inicio de turno',
  fin_turno: 'Fin de turno',
  extraordinaria: 'Extraordinaria',
};

export const ESTADOS_VERIFICACION = ['con_novedades', 'completada', 'borrador'] as const satisfies readonly EstadoVerificacionInventario[];

export const ETIQUETAS_ESTADO_VERIFICACION: Record<EstadoVerificacionInventario, string> = {
  borrador: 'En curso',
  completada: 'Completada',
  con_novedades: 'Con novedades',
};

export const ETIQUETAS_ESTADO_CONTEO: Record<EstadoConteo, string> = {
  conforme: 'Conforme',
  faltante: 'Faltante',
  sobrante: 'Sobrante',
  vencido: 'Vencido',
  danado: 'Dañado',
};

export const LONGITUD_MAXIMA_RESOLUCION = 2000;

export const RANGO_TEMPERATURA = { minimo: -50, maximo: 100 } as const;
export const RANGO_HUMEDAD = { minimo: 0, maximo: 100 } as const;
