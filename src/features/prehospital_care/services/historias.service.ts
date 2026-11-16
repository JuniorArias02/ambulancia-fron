import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import { nombreDeArchivo } from '../../../utils/descargas';
import type {
  ArchivoDescargado,
  CatalogosClinicos,
  DetalleHistoria,
  FichaPaciente,
  FiltrosHistorias,
  FiltrosPacientes,
  IndicadoresClinicos,
  IngresoServicio,
  PaginaHistorias,
  PaginaPacientes,
  PaginaTrazabilidad,
} from '../types/historia_clinica.types';

const LIMITE_MAXIMO = 100;
/** Generar un PDF o un CSV grande tarda más que una consulta normal. */
const ESPERA_DESCARGA_MS = 60_000;

/** El backend responde 400 a un parámetro vacío: solo se envían los que tienen valor. */
function soloConValor(filtros: FiltrosHistorias | FiltrosPacientes): Record<string, string | number | boolean> {
  const parametros: Record<string, string | number | boolean> = {};
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null || valor === '') continue;
    if (typeof valor === 'string' || typeof valor === 'number' || typeof valor === 'boolean') parametros[clave] = valor;
  }
  return parametros;
}

/** Cada búsqueda queda auditada en el backend (solo qué filtros se usaron, no sus valores). */
export async function buscarHistorias(filtros: FiltrosHistorias, senal?: AbortSignal): Promise<PaginaHistorias> {
  const { data } = await api.get<PaginaHistorias>('/consulta-clinica/historias', {
    params: soloConValor(filtros),
    signal: senal,
  });
  return data;
}

/** Cada apertura queda auditada: no se precarga desde la bandeja. */
export async function obtenerHistoria(id: string): Promise<DetalleHistoria> {
  const { data } = await api.get<DetalleHistoria>(`/historias-clinicas/${encodeURIComponent(id)}`);
  return data;
}

/** Del más antiguo al más reciente. */
export async function obtenerTrazabilidad(id: string, pagina: number, limite: number): Promise<PaginaTrazabilidad> {
  const { data } = await api.get<PaginaTrazabilidad>(
    `/consulta-clinica/historias/${encodeURIComponent(id)}/trazabilidad`,
    { params: { pagina, limite } },
  );
  return data;
}

/** Acepta el número `EMG-…` (sin importar mayúsculas) o el id de la emergencia. */
export async function obtenerIngreso(numeroOId: string): Promise<IngresoServicio> {
  const { data } = await api.get<IngresoServicio>(`/consulta-clinica/ingresos/${encodeURIComponent(numeroOId)}`);
  return data;
}

export async function anularHistoria(id: string, motivo: string): Promise<void> {
  await api.post(`/historias-clinicas/${encodeURIComponent(id)}/anular`, { motivo });
}

/** La versión de la firma que se usó al cerrar; PNG con el token, sin caché. */
export async function obtenerImagenFirmaCierre(id: string, senal?: AbortSignal): Promise<Blob> {
  const { data } = await api.get<Blob>(`/historias-clinicas/${encodeURIComponent(id)}/firma-cierre/imagen`, {
    responseType: 'blob',
    signal: senal,
  });
  return data;
}

/** Firma del paciente, familiar, testigo o receptor; PNG con el token. */
export async function obtenerImagenFirmaHistoria(id: string, firmaId: string, senal?: AbortSignal): Promise<Blob> {
  const { data } = await api.get<Blob>(
    `/historias-clinicas/${encodeURIComponent(id)}/firmas/${encodeURIComponent(firmaId)}/imagen`,
    { responseType: 'blob', signal: senal },
  );
  return data;
}

/** Textos de las firmas y demás valores fijos; casi nunca cambian. */
export async function obtenerCatalogos(): Promise<CatalogosClinicos> {
  const { data } = await api.get<CatalogosClinicos>('/historias-clinicas/catalogos');
  return data;
}

/** PDF con las secciones, todas las firmas y el código de verificación (consulta auditada). */
export async function descargarPdfHistoria(id: string, numeroHistoria: string): Promise<ArchivoDescargado> {
  const respuesta = await api.get<Blob>(`/historias-clinicas/${encodeURIComponent(id)}/pdf`, {
    responseType: 'blob',
    timeout: ESPERA_DESCARGA_MS,
  });
  return { contenido: respuesta.data, nombre: nombreDeArchivo(respuesta.headers['content-disposition'], `${numeroHistoria}.pdf`) };
}

/**
 * CSV para Excel con los filtros de la bandeja. El backend rechaza `pagina`, `limite` y `orden`
 * (400) y más de 5000 filas (422). Es la operación más sensible: queda auditada.
 */
export async function exportarHistorias(filtros: FiltrosHistorias, hoy: string): Promise<ArchivoDescargado> {
  const { pagina: _pagina, limite: _limite, orden: _orden, ...sinPaginacion } = filtros;
  const parametros: Record<string, string | number | boolean> = {};
  for (const [clave, valor] of Object.entries(sinPaginacion)) {
    if (typeof valor === 'string' ? valor !== '' : typeof valor === 'number' || typeof valor === 'boolean') {
      parametros[clave] = valor;
    }
  }
  const respuesta = await api.get<Blob>('/consulta-clinica/historias/exportar', {
    params: parametros,
    responseType: 'blob',
    timeout: ESPERA_DESCARGA_MS,
  });
  return {
    contenido: respuesta.data,
    nombre: nombreDeArchivo(respuesta.headers['content-disposition'], `historias-clinicas-${hoy}.csv`),
  };
}

/** Índice de pacientes por documento o nombre (auditado sin los valores). */
export async function buscarPacientes(filtros: FiltrosPacientes): Promise<PaginaPacientes> {
  const { data } = await api.get<PaginaPacientes>('/consulta-clinica/pacientes', { params: soloConValor(filtros) });
  return data;
}

export async function obtenerFichaPaciente(id: string): Promise<FichaPaciente> {
  const { data } = await api.get<FichaPaciente>(`/consulta-clinica/pacientes/${encodeURIComponent(id)}`);
  return data;
}

/** Días `AAAA-MM-DD` de Colombia; máximo 366 días (422). */
export async function obtenerIndicadores(desde: string, hasta: string): Promise<IndicadoresClinicos> {
  const { data } = await api.get<IndicadoresClinicos>('/consulta-clinica/indicadores', { params: { desde, hasta } });
  return data;
}

// --- Opciones de los filtros (recursos que ya existen) -------------------------

async function cargarTodo<T>(ruta: string, parametros: Record<string, string> = {}): Promise<T[]> {
  const pedir = (pagina: number) =>
    api
      .get<ResultadoPaginado<T>>(ruta, { params: { ...parametros, pagina, limite: LIMITE_MAXIMO } })
      .then(({ data }) => data);
  const primera = await pedir(1);
  const paginas = Math.ceil(primera.total / LIMITE_MAXIMO);
  if (paginas <= 1) return primera.datos;
  const resto = await Promise.all(Array.from({ length: paginas - 1 }, (_, indice) => pedir(indice + 2)));
  return [primera, ...resto].flatMap((pagina) => pagina.datos);
}

export interface AmbulanciaOpcion {
  id: string;
  codigo: string;
  placa: string;
}

export interface InstitucionOpcion {
  id: string;
  nombre: string;
  direccion: string | null;
  coordenadas: PuntoMapa | null;
}

export interface ProfesionalOpcion {
  id: string;
  nombres: string;
  apellidos: string;
}

export const listarAmbulanciasOpciones = () => cargarTodo<AmbulanciaOpcion>('/ambulancias');
export const listarInstitucionesOpciones = () => cargarTodo<InstitucionOpcion>('/instituciones-salud');
export const listarParamedicosOpciones = () => cargarTodo<ProfesionalOpcion>('/usuarios', { rol: 'paramedico' });
