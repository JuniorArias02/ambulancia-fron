import { api } from '../../../services/api';
import { ErrorApi } from '../../../services/error_api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  Asignacion,
  EstadoAvance,
  EventoAsignacion,
  FiltrosAsignaciones,
  PuntoRecorrido,
} from '../types/asignacion.types';
import type { Ruta } from '../schemas/ruta.schema';

function rutaAsignacion(id: string): string {
  return `/asignaciones/${encodeURIComponent(id)}`;
}

export async function listarAsignaciones(
  filtros: FiltrosAsignaciones,
): Promise<ResultadoPaginado<Asignacion>> {
  const { soloActivas, ...resto } = filtros;
  const { data } = await api.get<ResultadoPaginado<Asignacion>>('/asignaciones', {
    params: { ...resto, soloActivas: soloActivas ? true : undefined },
  });
  return data;
}

export async function despachar(emergenciaId: string, ambulanciaId: string): Promise<Asignacion> {
  const { data } = await api.post<Asignacion>('/asignaciones', { emergenciaId, ambulanciaId });
  return data;
}

/** Repetir un paso ya hecho responde `200` sin duplicarlo: los reintentos son seguros. */
export async function marcarAvance(id: string, estado: EstadoAvance, observacion?: string): Promise<Asignacion> {
  const { data } = await api.patch<Asignacion>(`${rutaAsignacion(id)}/avance`, { estado, observacion });
  return data;
}

/** Bitácora del servicio: cada paso con su hora, responsable y rol, en orden. */
export async function listarEventosAsignacion(id: string): Promise<EventoAsignacion[]> {
  const { data } = await api.get<EventoAsignacion[]>(`${rutaAsignacion(id)}/eventos`);
  return data;
}

export async function cancelarAsignacion(id: string, motivo: string): Promise<Asignacion> {
  const { data } = await api.patch<Asignacion>(`${rutaAsignacion(id)}/cancelar`, { motivo });
  return data;
}

/** Una ruta por cada ambulancia que va hacia una emergencia; sin GPS reciente aún no aparece. */
export async function listarRutasActivas(): Promise<Ruta[]> {
  const { data } = await api.get<Ruta[]>('/rutas/activas');
  return data;
}

/**
 * Ruta de un servicio. `null` si aún no se pudo calcular (sin GPS reciente o emergencia sin
 * coordenadas): no es un error, llegará con `asignacion.ruta_actualizada`.
 */
export async function obtenerRutaAsignacion(id: string): Promise<Ruta | null> {
  try {
    const { data } = await api.get<Ruta>(`${rutaAsignacion(id)}/ruta`);
    return data;
  } catch (error) {
    if (error instanceof ErrorApi && error.estado === 404 && /ruta/i.test(error.message)) return null;
    throw error;
  }
}

/** Puntos GPS de un servicio, en orden cronológico. */
export async function listarRecorrido(asignacionId: string): Promise<PuntoRecorrido[]> {
  const { data } = await api.get<PuntoRecorrido[]>('/ubicaciones', { params: { asignacionId } });
  return data;
}
