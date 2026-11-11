import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type { ChequeoDiario, FiltrosChequeos } from '../types/chequeo_diario.types';

export async function listarChequeos(filtros: FiltrosChequeos): Promise<ResultadoPaginado<ChequeoDiario>> {
  const { data } = await api.get<ResultadoPaginado<ChequeoDiario>>('/chequeos-diarios', { params: filtros });
  return data;
}

/** Trae el texto de cada pregunta y calificación, aunque se hayan desactivado después. */
export async function obtenerChequeo(id: string): Promise<ChequeoDiario> {
  const { data } = await api.get<ChequeoDiario>(`/chequeos-diarios/${encodeURIComponent(id)}`);
  return data;
}
