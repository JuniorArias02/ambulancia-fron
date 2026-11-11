import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type { FiltrosTurnos, Turno } from '../types/turno.types';

function rutaTurno(id: string): string {
  return `/turnos/${encodeURIComponent(id)}`;
}

export async function listarTurnos(filtros: FiltrosTurnos): Promise<ResultadoPaginado<Turno>> {
  const { data } = await api.get<ResultadoPaginado<Turno>>('/turnos', { params: filtros });
  return data;
}

/** Cierra un turno que quedó abierto. La tripulación la arman el conductor y el paramédico desde la app. */
export async function finalizarTurno(id: string): Promise<Turno> {
  const { data } = await api.patch<Turno>(`${rutaTurno(id)}/finalizar`);
  return data;
}
