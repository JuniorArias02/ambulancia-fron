// Tipos del módulo de inventario (`/inventario/*`). Fechas de calendario `AAAA-MM-DD`; con hora, ISO 8601.

export type TipoInsumo =
  | 'medicamento'
  | 'dispositivo_medico'
  | 'insumo_asistencial'
  | 'equipo_biomedico'
  | 'oxigeno_medicinal'
  | 'otro';

/** Qué se indica al mover el insumo: `equipoId` (serie), `loteId` (lote) o nada (insumo). */
export type ControlInsumo = 'serie' | 'lote' | 'insumo';

export interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo: TipoInsumo;
  categoria: string | null;
  unidadMedida: string;
  marca: string | null;
  fabricante: string | null;
  requiereLote: boolean;
  requiereVencimiento: boolean;
  requiereRegistroSanitario: boolean;
  requiereSerie: boolean;
  esControlEspecial: boolean;
  control: ControlInsumo;
  stockMinimo: number;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DatosInsumo {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipo: TipoInsumo;
  categoria: string | null;
  unidadMedida: string;
  marca: string | null;
  fabricante: string | null;
  requiereLote: boolean;
  requiereVencimiento: boolean;
  requiereRegistroSanitario: boolean;
  requiereSerie: boolean;
  esControlEspecial: boolean;
  stockMinimo: number;
}

export interface FiltrosInsumos {
  busqueda?: string;
  tipo?: TipoInsumo;
  activo?: boolean;
  esControlEspecial?: boolean;
  pagina: number;
  limite: number;
}

export type TipoRegistroSanitario =
  | 'registro_sanitario'
  | 'permiso_comercializacion'
  | 'notificacion_sanitaria'
  | 'otro';

export type EstadoRegistroSanitario = 'vigente' | 'vencido' | 'suspendido' | 'cancelado';

export interface RegistroSanitario {
  id: string;
  insumoId: string;
  insumoNombre: string | null;
  numeroRegistro: string;
  tipoRegistro: TipoRegistroSanitario;
  fechaExpedicion: string | null;
  fechaVencimiento: string | null;
  titular: string | null;
  documentoUrl: string | null;
  estado: EstadoRegistroSanitario;
  /** Estado `vigente` y sin vencer. */
  vigenteHoy: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DatosRegistroSanitario {
  insumoId: string;
  numeroRegistro: string;
  tipoRegistro: TipoRegistroSanitario;
  fechaExpedicion: string | null;
  fechaVencimiento: string | null;
  titular: string | null;
  documentoUrl: string | null;
  estado: EstadoRegistroSanitario;
}

export interface FiltrosRegistros {
  insumoId?: string;
  estado?: EstadoRegistroSanitario;
  vencenHasta?: string;
  pagina: number;
  limite: number;
}

export interface Bodega {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion: string | null;
  responsableId: string | null;
  responsableNombre: string | null;
  /** Id que se usa como origen o destino de los movimientos. */
  ubicacionInventarioId: string | null;
  activa: boolean;
  creadaEn: string;
  actualizadaEn: string;
}

export interface DatosBodega {
  codigo: string;
  nombre: string;
  ubicacion: string | null;
  responsableId?: string | null;
}

export interface FiltrosBodegas {
  busqueda?: string;
  activa?: boolean;
  pagina: number;
  limite: number;
}

export type TipoUbicacion = 'bodega' | 'ambulancia';

export interface UbicacionInventario {
  id: string;
  tipo: TipoUbicacion;
  /** Nombre de la bodega o código de la ambulancia. */
  nombre: string | null;
  bodegaId: string | null;
  ambulanciaId: string | null;
  activa: boolean;
}

export interface Lote {
  id: string;
  insumoId: string;
  insumoNombre: string | null;
  registroSanitarioId: string | null;
  numeroLote: string;
  fechaFabricacion: string | null;
  fechaVencimiento: string | null;
  vencido: boolean;
  fabricante: string | null;
  proveedor: string | null;
  recibidoEn: string | null;
  documentoSoporte: string | null;
  observaciones: string | null;
  creadoEn: string;
}

export interface DatosActualizarLote {
  fechaFabricacion: string | null;
  fechaVencimiento: string | null;
  fabricante: string | null;
  proveedor: string | null;
  documentoSoporte: string | null;
  observaciones: string | null;
}

export interface DatosCrearLote extends DatosActualizarLote {
  insumoId: string;
  registroSanitarioId: string | null;
  numeroLote: string;
  recibidoEn: string | null;
}

export interface FiltrosLotes {
  insumoId?: string;
  busqueda?: string;
  vencenHasta?: string;
  pagina: number;
  limite: number;
}

export type EstadoEquipo = 'operativo' | 'mantenimiento' | 'fuera_servicio' | 'baja';

export interface Equipo {
  id: string;
  insumoId: string;
  insumoNombre: string | null;
  registroSanitarioId: string | null;
  numeroSerie: string;
  marca: string | null;
  modelo: string | null;
  fechaAdquisicion: string | null;
  estado: EstadoEquipo;
  fechaUltimoMantenimiento: string | null;
  fechaProximoMantenimiento: string | null;
  observaciones: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface DatosActualizarEquipo {
  marca: string | null;
  modelo: string | null;
  fechaAdquisicion: string | null;
  fechaProximoMantenimiento: string | null;
  observaciones: string | null;
}

export interface DatosCrearEquipo extends DatosActualizarEquipo {
  insumoId: string;
  registroSanitarioId: string | null;
  numeroSerie: string;
}

export interface FiltrosEquipos {
  insumoId?: string;
  estado?: EstadoEquipo;
  busqueda?: string;
  mantenimientoHasta?: string;
  pagina: number;
  limite: number;
}

export type TipoMantenimiento = 'preventivo' | 'correctivo' | 'calibracion';

export interface Mantenimiento {
  id: string;
  equipoId: string;
  tipo: TipoMantenimiento;
  fechaMantenimiento: string;
  fechaProximo: string | null;
  responsable: string | null;
  proveedor: string | null;
  documentoSoporte: string | null;
  resultado: string | null;
  observaciones: string | null;
  creadoEn: string;
}

export type DatosMantenimiento = Omit<Mantenimiento, 'id' | 'equipoId' | 'creadoEn'>;

export type TipoMovimiento = 'entrada' | 'transferencia' | 'consumo' | 'devolucion' | 'ajuste' | 'baja';
export type EstadoMovimiento = 'borrador' | 'confirmado' | 'anulado';

export interface LineaMovimiento {
  id: string;
  insumoId: string;
  insumoCodigo: string;
  insumoNombre: string;
  unidadMedida: string;
  loteId: string | null;
  numeroLote: string | null;
  loteVencimiento: string | null;
  equipoId: string | null;
  numeroSerie: string | null;
  equipoEstado: EstadoEquipo | null;
  cantidad: number;
  observaciones: string | null;
}

export interface UbicacionMovimiento {
  id: string;
  tipo: TipoUbicacion;
  nombre: string | null;
}

export interface Movimiento {
  id: string;
  /** Lo genera el backend, p. ej. `MOV-20261111-1A2B3C4D`. */
  codigo: string;
  tipo: TipoMovimiento;
  estado: EstadoMovimiento;
  origen: UbicacionMovimiento | null;
  destino: UbicacionMovimiento | null;
  asignacionId: string | null;
  usuarioId: string;
  usuarioNombre: string | null;
  motivo: string | null;
  observaciones: string | null;
  documentoReferencia: string | null;
  realizadoEn: string;
  creadoEn: string;
  actualizadoEn: string;
  lineas: LineaMovimiento[];
}

export interface DatosLineaMovimiento {
  insumoId: string;
  loteId?: string;
  equipoId?: string;
  cantidad: number;
}

export interface DatosMovimiento {
  tipo: TipoMovimiento;
  origenUbicacionId: string | null;
  destinoUbicacionId: string | null;
  motivo: string | null;
  documentoReferencia: string | null;
  observaciones: string | null;
  realizadoEn?: string;
  confirmar: boolean;
  lineas: DatosLineaMovimiento[];
}

export interface FiltrosMovimientos {
  tipo?: TipoMovimiento;
  estado?: EstadoMovimiento;
  ubicacionId?: string;
  insumoId?: string;
  desde?: string;
  hasta?: string;
  pagina: number;
  limite: number;
}

export interface Existencia {
  id: string;
  ubicacionId: string;
  ubicacionTipo: TipoUbicacion;
  ubicacionNombre: string | null;
  insumoId: string;
  insumoCodigo: string;
  insumoNombre: string;
  unidadMedida: string;
  loteId: string | null;
  numeroLote: string | null;
  loteVencimiento: string | null;
  equipoId: string | null;
  numeroSerie: string | null;
  equipoEstado: EstadoEquipo | null;
  /** Identifica la unidad de control (insumo, lote o equipo) dentro de la ubicación. */
  claveControl: string;
  cantidad: number;
  /** `false`: lote vencido o equipo no operativo. */
  utilizable: boolean;
  actualizadaEn: string;
}

export interface FiltrosExistencias {
  ubicacionId?: string;
  tipoUbicacion?: TipoUbicacion;
  insumoId?: string;
  tipoInsumo?: TipoInsumo;
  busqueda?: string;
  incluirAgotadas?: boolean;
  pagina: number;
  limite: number;
}

export type EstadoDotacion = 'completo' | 'incompleto' | 'bajo_minimo';

export interface TotalInsumo {
  insumoId: string;
  insumoCodigo: string;
  insumoNombre: string;
  unidadMedida: string;
  disponible: number;
  noUtilizable: number;
}

export interface ItemDotacion extends TotalInsumo {
  detallePerfilId: string;
  cantidadRequerida: number;
  cantidadMinima: number | null;
  obligatorio: boolean;
  /** Lo que hay que transferir para completar. */
  faltante: number;
  estado: EstadoDotacion;
}

export interface Dotacion {
  ambulanciaId: string;
  ambulanciaCodigo: string;
  fecha: string;
  ubicacion: UbicacionInventario | null;
  /** `null`: el tipo de ambulancia no tiene un perfil vigente. */
  perfil: { id: string; codigo: string; nombre: string; version: number } | null;
  completa: boolean | null;
  items: ItemDotacion[];
  adicionales: TotalInsumo[];
  existencias: Existencia[];
}

export interface Alertas {
  hasta: string;
  lotesPorVencer: {
    loteId: string;
    numeroLote: string;
    fechaVencimiento: string;
    insumoId: string;
    insumoNombre: string;
    ubicacionId: string;
    ubicacionNombre: string | null;
    cantidad: number;
  }[];
  equiposPorMantenimiento: {
    equipoId: string;
    numeroSerie: string;
    insumoNombre: string;
    estado: EstadoEquipo;
    fechaProximoMantenimiento: string;
  }[];
  registrosPorVencer: {
    registroId: string;
    numeroRegistro: string;
    insumoId: string;
    insumoNombre: string;
    fechaVencimiento: string;
  }[];
  insumosBajoMinimo: {
    insumoId: string;
    insumoCodigo: string;
    insumoNombre: string;
    unidadMedida: string;
    stockMinimo: number;
    enBodegas: number;
  }[];
}

export interface DetallePerfil {
  id: string;
  insumoId: string;
  insumoCodigo: string;
  insumoNombre: string;
  unidadMedida: string;
  cantidadRequerida: number;
  /** `null` equivale a la requerida. */
  cantidadMinima: number | null;
  obligatorio: boolean;
  observaciones: string | null;
}

export interface PerfilDotacion {
  id: string;
  tipoAmbulanciaId: string;
  tipoAmbulanciaNombre: string | null;
  codigo: string;
  nombre: string;
  version: number;
  descripcion: string | null;
  vigenteDesde: string | null;
  vigenteHasta: string | null;
  activo: boolean;
  /** Activo y con la fecha de hoy dentro de su vigencia: es el que rige. */
  vigenteHoy: boolean;
  creadoEn: string;
  actualizadoEn: string;
  detalles: DetallePerfil[];
}

export interface DatosDatosPerfil {
  nombre: string;
  descripcion: string | null;
  vigenteDesde: string | null;
  vigenteHasta: string | null;
}

export interface DatosCrearPerfil extends DatosDatosPerfil {
  tipoAmbulanciaId: string;
  codigo: string;
}

export interface DatosDetallePerfil {
  cantidadRequerida: number;
  cantidadMinima: number | null;
  obligatorio: boolean;
  observaciones: string | null;
}

export interface FiltrosPerfiles {
  tipoAmbulanciaId?: string;
  activo?: boolean;
  codigo?: string;
  pagina: number;
  limite: number;
}

export interface ControlAlmacenamiento {
  id: string;
  ubicacionId: string;
  ubicacionNombre: string | null;
  usuarioId: string;
  usuarioNombre: string | null;
  temperatura: number | null;
  humedad: number | null;
  registradoEn: string;
  observaciones: string | null;
  creadoEn: string;
}

export interface DatosControlAlmacenamiento {
  ubicacionId: string;
  temperatura: number | null;
  humedad: number | null;
  observaciones: string | null;
}

export interface FiltrosControles {
  ubicacionId?: string;
  desde?: string;
  hasta?: string;
  pagina: number;
  limite: number;
}

export type TipoVerificacion = 'inicio_turno' | 'fin_turno' | 'extraordinaria';
export type EstadoVerificacionInventario = 'borrador' | 'completada' | 'con_novedades';
export type EstadoConteo = 'conforme' | 'faltante' | 'sobrante' | 'vencido' | 'danado';

export interface Conteo {
  id: string;
  insumoId: string;
  insumoNombre: string;
  loteId: string | null;
  numeroLote: string | null;
  equipoId: string | null;
  numeroSerie: string | null;
  perfilDetalleId: string | null;
  /** Lo que decía el sistema. */
  cantidadEsperada: number;
  cantidadEncontrada: number;
  estado: EstadoConteo;
  observaciones: string | null;
  creadoEn: string;
}

export interface VerificacionInventario {
  id: string;
  ubicacionId: string;
  ubicacionNombre: string | null;
  turnoId: string | null;
  responsableId: string;
  responsableNombre: string | null;
  tipo: TipoVerificacion;
  estado: EstadoVerificacionInventario;
  iniciadaEn: string;
  finalizadaEn: string | null;
  observaciones: string | null;
  totalNovedades: number;
  /** Tiene novedades y nadie las ha revisado: va a la bandeja. */
  pendienteDeRevision: boolean;
  /** Constancia de la revisión; `null` mientras no se revise y en las `completada` o `borrador`. */
  revision: RevisionVerificacion | null;
  conteos: Conteo[];
}

export interface RevisionVerificacion {
  revisadaPorId: string | null;
  revisadaPorNombre: string | null;
  revisadaEn: string;
  /** Cómo se resolvieron las novedades; idealmente cita los movimientos usados. */
  resolucion: string;
}

export interface FiltrosVerificacionesInventario {
  ubicacionId?: string;
  /** Solo aplica a las que tienen novedades: `false` pendientes, `true` ya revisadas. */
  revisada?: boolean;
  estado?: EstadoVerificacionInventario;
  tipo?: TipoVerificacion;
  desde?: string;
  hasta?: string;
  pagina: number;
  limite: number;
}
