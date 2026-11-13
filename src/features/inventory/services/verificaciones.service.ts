import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type { FiltrosVerificacionesInventario, VerificacionInventario } from '../types/inventario.types';

export async function listarVerificacionesInventario(
  filtros: FiltrosVerificacionesInventario,
): Promise<ResultadoPaginado<VerificacionInventario>> {
  const { data } = await api.get<ResultadoPaginado<VerificacionInventario>>('/inventario/verificaciones', {
    params: filtros,
  });
  return data;
}

/**
 * Deja constancia de cómo se resolvieron las novedades. No cambia existencias: la corrección se
 * hace antes con movimientos. Responde la verificación con su `revision`; 409 si ya fue revisada.
 */
export async function revisarVerificacionInventario(verificacionId: string, resolucion: string): Promise<VerificacionInventario> {
  const { data } = await api.post<VerificacionInventario>(
    `/inventario/verificaciones/${encodeURIComponent(verificacionId)}/revision`,
    { resolucion },
  );
  return data;
}

export async function obtenerVerificacionInventario(verificacionId: string): Promise<VerificacionInventario> {
  const { data } = await api.get<VerificacionInventario>(`/inventario/verificaciones/${encodeURIComponent(verificacionId)}`);
  return data;
}
