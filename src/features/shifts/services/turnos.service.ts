import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type { DatosIniciarTurno, DatosIntegrante, FiltrosTurnos, Turno } from '../types/turno.types';

function rutaTurno(id: string): string {
  return `/turnos/${encodeURIComponent(id)}`;
}

export async function listarTurnos(filtros: FiltrosTurnos): Promise<ResultadoPaginado<Turno>> {
  const { data } = await api.get<ResultadoPaginado<Turno>>('/turnos', { params: filtros });
  return data;
}

export async function iniciarTurno(datos: DatosIniciarTurno): Promise<Turno> {
  const { data } = await api.post<Turno>('/turnos', datos);
  return data;
}

/** Reemplaza la tripulación completa (p. ej. un relevo). */
export async function cambiarIntegrantes(id: string, integrantes: DatosIntegrante[]): Promise<Turno> {
  const { data } = await api.put<Turno>(`${rutaTurno(id)}/integrantes`, { integrantes });
  return data;
}

export async function finalizarTurno(id: string): Promise<Turno> {
  const { data } = await api.patch<Turno>(`${rutaTurno(id)}/finalizar`);
  return data;
}
