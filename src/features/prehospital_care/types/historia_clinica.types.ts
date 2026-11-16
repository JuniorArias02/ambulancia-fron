import type { ModalidadServicio } from '../../../constants/modalidades_servicio';
import type { ResultadoPaginado } from '../../../types/paginacion.types';

// Contratos de la consulta clínica del administrador (solo lectura, salvo anular).

export type EstadoHistoria = 'borrador' | 'cerrada' | 'anulada';
export type EstadoFiltroHistoria = 'vigentes' | 'borrador' | 'cerrada' | 'anulada' | 'todos';
export type Triage = 'rojo' | 'amarillo' | 'verde' | 'negro';
export type Desenlace = 'trasladado' | 'rechazo_traslado' | 'atendido_en_sitio' | 'fallecido_en_sitio';
export type TipoEvento = 'transito' | 'caida' | 'arma_fuego' | 'arma_blanca' | 'quemadura' | 'clinico' | 'otro';
export type RegimenAfiliacion = 'contributivo' | 'subsidiado' | 'especial_excepcion' | 'no_afiliado';
export type Sexo = 'masculino' | 'femenino' | 'indeterminado';
export type TipoDocumento = 'CC' | 'TI' | 'RC' | 'CE' | 'PA' | 'PEP' | 'PPT' | 'AS' | 'MS';
export type RolVictima = 'conductor' | 'pasajero' | 'peaton' | 'motociclista' | 'ciclista';
export type CampoFecha = 'atencion' | 'evento' | 'cierre';
export type OrdenHistorias = 'fecha_desc' | 'fecha_asc' | 'numero' | 'paciente';
export type NivelRiesgoCaida = 'bajo' | 'alto';
export type TipoIntervencion = 'procedimiento' | 'medicamento';

export interface Persona {
  id: string;
  nombreCompleto: string | null;
}

// --- Bandeja -----------------------------------------------------------------

export interface PacienteResumen {
  /** `false` es un NN: los nombres y el documento pueden venir vacíos. */
  identificado: boolean;
  nombres: string | null;
  apellidos: string | null;
  tipoDocumento: TipoDocumento | null;
  numeroDocumento: string | null;
  sexo: Sexo | null;
  fechaNacimiento: string | null;
  edadAproximada: number | null;
  /** A la fecha de la atención; sin fecha de nacimiento, la aproximada. */
  edadAnios: number | null;
}

export interface ResumenHistoria {
  id: string;
  numeroHistoria: string;
  estado: EstadoHistoria;
  abiertaEn: string;
  horaEvento: string | null;
  cerradaEn: string | null;
  paciente: PacienteResumen;
  triage: Triage | null;
  desenlace: Desenlace | null;
  tipoEvento: TipoEvento | null;
  impresionDiagnostica: string | null;
  aseguradoraEps: string | null;
  regimenAfiliacion: RegimenAfiliacion | null;
  ingreso: { emergenciaId: string; numeroEmergencia: string; modalidad: ModalidadServicio };
  ambulancia: { id: string; codigo: string; placa: string } | null;
  institucionDestino: { id: string; nombre: string } | null;
  creadaPor: Persona;
  cerradaPor: Persona | null;
  firmada: boolean;
  riesgoCaidaAlto: boolean;
  totales: { signosVitales: number; lesiones: number; intervenciones: number; valoracionesDownton: number };
}

/** Lo que se envía a `GET /consulta-clinica/historias`; los vacíos se omiten. */
export interface FiltrosHistorias {
  desde?: string;
  hasta?: string;
  campoFecha?: CampoFecha;
  ingreso?: string;
  numeroHistoria?: string;
  documento?: string;
  nombre?: string;
  soloNn?: boolean;
  estado?: EstadoFiltroHistoria;
  triage?: Triage;
  desenlace?: Desenlace;
  tipoEvento?: TipoEvento;
  modalidad?: ModalidadServicio;
  riesgoCaidaAlto?: boolean;
  firmada?: boolean;
  ambulanciaId?: string;
  institucionDestinoId?: string;
  profesionalId?: string;
  eps?: string;
  regimen?: RegimenAfiliacion;
  orden?: OrdenHistorias;
  pagina: number;
  limite: number;
}

// --- Expediente --------------------------------------------------------------

export interface DatosHistoria {
  pacienteIdentificado: boolean;
  nombres: string | null;
  apellidos: string | null;
  tipoDocumento: TipoDocumento | null;
  numeroDocumento: string | null;
  sexo: Sexo | null;
  edadAproximada: number | null;
  fechaNacimiento: string | null;
  aseguradoraEps: string | null;
  regimenAfiliacion: RegimenAfiliacion | null;
  acompananteNombre: string | null;
  acompananteTelefono: string | null;
  horaEvento: string | null;
  tipoEvento: TipoEvento | null;
  mecanismoLesion: string | null;
  rolVictima: RolVictima | null;
  elementosProteccion: string | null;
  placaVehiculo: string | null;
  polizaSoat: string | null;
  xHemorragiaMasiva: string | null;
  aViaAerea: string | null;
  bRespiracion: string | null;
  cCirculacion: string | null;
  dNeurologico: string | null;
  eExposicion: string | null;
  triage: Triage | null;
  alergias: string | null;
  medicamentosHabituales: string | null;
  antecedentes: string | null;
  impresionDiagnostica: string | null;
  observaciones: string | null;
  desenlace: Desenlace | null;
  motivoRechazo: string | null;
  institucionDestinoId: string | null;
  condicionEntrega: string | null;
  receptorNombre: string | null;
  receptorCargo: string | null;
  entregadoEn: string | null;
}

export interface SignoVital {
  id: string;
  medidoEn: string;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  frecuenciaCardiaca: number | null;
  frecuenciaRespiratoria: number | null;
  saturacionOxigeno: number | null;
  temperatura: number | null;
  glucometria: number | null;
  glasgowOcular: number | null;
  glasgowVerbal: number | null;
  glasgowMotor: number | null;
  glasgowTotal: number | null;
  escalaDolor: number | null;
  registradoPor: Persona;
}

export interface Lesion {
  id: string;
  regionCorporal: string;
  tipoLesion: string;
  descripcion: string | null;
}

export interface Intervencion {
  id: string;
  tipo: TipoIntervencion;
  nombre: string;
  dosis: string | null;
  via: string | null;
  realizadoEn: string | null;
  resultado: string | null;
  registradoPor: Persona;
}

export interface ValoracionDownton {
  id: string;
  evaluadaEn: string;
  caidasPrevias: boolean;
  medTranquilizantesSedantes: boolean;
  medDiureticos: boolean;
  medHipotensores: boolean;
  medAntiparkinsonianos: boolean;
  medAntidepresivos: boolean;
  medOtros: boolean;
  deficitVisual: boolean;
  deficitAuditivo: boolean;
  deficitExtremidades: boolean;
  estadoMental: 'orientado' | 'confuso';
  deambulacion: 'normal' | 'segura_con_ayuda' | 'insegura' | 'imposible';
  puntajeTotal: number;
  nivelRiesgo: NivelRiesgoCaida;
  observacion: string | null;
  registradoPor: Persona;
}

export interface DetalleHistoria {
  id: string;
  numeroHistoria: string;
  estado: EstadoHistoria;
  emergenciaId: string;
  numeroEmergencia: string | null;
  /** Tipo de servicio del ingreso: define qué firmas exige la historia. */
  modalidad: ModalidadServicio;
  asignacionId: string | null;
  abiertaEn: string;
  cerradaEn: string | null;
  creadaPor: Persona;
  cerradaPor: Persona | null;
  hashCierre: string | null;
  firmaCierre: { id: string; registradaEn: string; huellaSha256: string } | null;
  institucionDestino: { id: string; nombre: string | null } | null;
  datos: DatosHistoria;
  signosVitales: SignoVital[];
  lesiones: Lesion[];
  intervenciones: Intervencion[];
  valoracionesDownton: ValoracionDownton[];
  /** Firmas del paciente, el familiar, el testigo y quien recibe (no la del profesional). */
  firmasHistoria: FirmaHistoria[];
  /** Solo en borrador: lo que falta para poder cerrarla. */
  faltantesParaCerrar: string[];
}

// --- Trazabilidad ------------------------------------------------------------

export type TipoAccionHistoria = 'creacion' | 'modificacion' | 'firma' | 'anulacion' | 'consulta';

export interface EventoTrazabilidad {
  id: string;
  accion: string;
  descripcion: string;
  tipo: TipoAccionHistoria;
  ocurridoEn: string;
  usuario: (Persona & { rol: string | null }) | null;
  direccionIp: string | null;
  /** Solo qué cambió, nunca valores clínicos. */
  detalle: Record<string, unknown>;
}

// --- Ingreso -----------------------------------------------------------------

export interface EmergenciaIngreso {
  id: string;
  numeroEmergencia: string;
  modalidad: ModalidadServicio;
  fuente: string;
  estado: string;
  descripcion: string;
  tipoIncidente: string | null;
  prioridad: string | null;
  direccion: string | null;
  referenciaLugar: string | null;
  latitud: number | null;
  longitud: number | null;
  origenUbicacion: string | null;
  numeroVictimas: number | null;
  informanteNombre: string | null;
  informanteTelefono: string | null;
  reportadaDesdeApp: boolean;
  recibidaEn: string;
  cerradaEn: string | null;
  recibidaPor: Persona | null;
  emergenciaPrincipal: { id: string; numeroEmergencia: string } | null;
  duplicadas: { id: string; numeroEmergencia: string; recibidaEn: string }[];
}

export interface EventoServicio {
  estadoAnterior: string | null;
  estadoNuevo: string;
  ocurridoEn: string;
  usuario: Persona | null;
  rolResponsable: string | null;
  latitud: number | null;
  longitud: number | null;
  distanciaEscenaMetros: number | null;
  fueraDeRadio: boolean;
  observacion: string | null;
}

export interface TiemposServicio {
  despachoSegundos: number | null;
  alistamientoSegundos: number | null;
  respuestaSegundos: number | null;
  enEscenaSegundos: number | null;
  trasladoSegundos: number | null;
  totalSegundos: number | null;
}

export interface MovimientoInsumos {
  id: string;
  codigo: string;
  tipo: string;
  estado: string;
  realizadoEn: string;
  registradoPor: Persona;
  items: {
    insumoId: string;
    codigo: string;
    nombre: string;
    unidadMedida: string;
    cantidad: number;
    numeroLote: string | null;
    numeroSerie: string | null;
  }[];
}

export interface AsignacionIngreso {
  id: string;
  estado: string;
  ambulancia: { id: string; codigo: string; placa: string; tipo: string };
  tripulacion: { usuarioId: string; nombreCompleto: string; funcion: string }[];
  asignadaPor: Persona | null;
  asignadaEn: string;
  salidaEn: string | null;
  llegadaEscenaEn: string | null;
  atencionInicioEn: string | null;
  salidaEscenaEn: string | null;
  llegadaDestinoEn: string | null;
  finalizadaEn: string | null;
  motivoCancelacion: string | null;
  institucionDestino: { id: string; nombre: string; direccion: string | null } | null;
  tiempos: TiemposServicio;
  eventos: EventoServicio[];
  recorrido: {
    puntos: { latitud: number; longitud: number; velocidad: number | null; registradaEn: string }[];
    totalPuntos: number;
    muestreado: boolean;
  };
  insumos: MovimientoInsumos[];
}

export interface IngresoServicio {
  emergencia: EmergenciaIngreso;
  asignaciones: AsignacionIngreso[];
  historias: ResumenHistoria[];
}

export type PaginaHistorias = ResultadoPaginado<ResumenHistoria>;
export type PaginaTrazabilidad = ResultadoPaginado<EventoTrazabilidad>;

/** Opción de los selects de filtros que salen de otros recursos. */
export interface OpcionRecurso {
  valor: string;
  texto: string;
  detalle?: string;
}

// --- Firmas de la historia (paciente, familiar, testigo, receptor) -------------

export type RolFirmante = 'paciente' | 'acudiente' | 'testigo' | 'receptor';
export type PropositoFirma = 'comprobante_atencion' | 'disentimiento' | 'entrega';
export type MotivoSinFirma = 'inconsciente_sin_acudiente' | 'fallecido' | 'se_nego' | 'otro';

export interface FirmaHistoria {
  id: string;
  rolFirmante: RolFirmante;
  proposito: PropositoFirma;
  nombreFirmante: string | null;
  tipoDocumento: string | null;
  numeroDocumento: string | null;
  parentesco: string | null;
  cargo: string | null;
  /** `null`: no firmó; el motivo está en `motivoSinFirma`. */
  imagen: { tamanoBytes: number; anchoPx: number; altoPx: number; huellaSha256: string } | null;
  motivoSinFirma: MotivoSinFirma | null;
  detalleMotivo: string | null;
  /** Versión del texto que aceptó el firmante. */
  textoVersion: string;
  firmadaEn: string;
  registradaPor: Persona;
}

/** Solo lo que usa la web de `GET /historias-clinicas/catalogos`. */
export interface CatalogosClinicos {
  textosFirma: Partial<Record<PropositoFirma, { version: string; texto: string }>>;
}

// --- Pacientes ---------------------------------------------------------------

export interface PacienteIndice {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string | null;
  apellidos: string | null;
  sexo: Sexo | null;
  fechaNacimiento: string | null;
  edadAnios: number | null;
  totalAtenciones: number;
  ultimaAtencion: string | null;
  ultimaEps: string | null;
  ultimoRegimen: string | null;
}

export interface FiltrosPacientes {
  documento?: string;
  nombre?: string;
  pagina: number;
  limite: number;
}

/** Un dato clínico reunido de las historias, con la historia de donde salió. */
export interface DatoReunido {
  valor: string;
  numeroHistoria: string;
  historiaId: string;
  fecha: string;
}

export interface FichaPaciente {
  paciente: PacienteIndice;
  atenciones: ResumenHistoria[];
  alergias: DatoReunido[];
  medicamentosHabituales: DatoReunido[];
  antecedentes: DatoReunido[];
  ultimoRiesgoCaida: {
    puntajeTotal: number;
    nivelRiesgo: string;
    evaluadaEn: string;
    numeroHistoria: string;
  } | null;
}

export type PaginaPacientes = ResultadoPaginado<PacienteIndice>;

// --- Indicadores -------------------------------------------------------------

export interface Conteo {
  /** `sin_dato` cuando la historia no tiene ese dato. */
  clave: string;
  total: number;
}

export interface EstadisticaTiempo {
  /** Cuántos servicios tenían las dos marcas de tiempo. */
  servicios: number;
  promedioSegundos: number | null;
  medianaSegundos: number | null;
  /** El 90 % de los servicios tardó esto o menos. */
  p90Segundos: number | null;
}

export interface IndicadoresClinicos {
  rango: { desde: string; hasta: string };
  totalHistorias: number;
  firmadas: number;
  rechazosTraslado: number;
  pacientesSinIdentificar: number;
  conRiesgoCaidaAlto: number;
  porEstado: Conteo[];
  porTriage: Conteo[];
  porDesenlace: Conteo[];
  porModalidad: Conteo[];
  porTipoEvento: Conteo[];
  porDia: { dia: string; total: number }[];
  institucionesDestino: { id: string; nombre: string; total: number }[];
  tiempos: { respuesta: EstadisticaTiempo; enEscena: EstadisticaTiempo; traslado: EstadisticaTiempo };
}

/** Archivo descargado (PDF o CSV) con el nombre que propone el backend. */
export interface ArchivoDescargado {
  contenido: Blob;
  nombre: string;
}
