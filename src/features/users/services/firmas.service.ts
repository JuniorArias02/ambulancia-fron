import { api } from '../../../services/api';
import type { FirmaUsuario } from '../types/firma.types';

const rutaFirmas = (usuarioId: string) => `/usuarios/${encodeURIComponent(usuarioId)}/firmas`;

/** De la más reciente a la más antigua. Vacía si nunca registró firma. */
export async function listarFirmasUsuario(usuarioId: string): Promise<FirmaUsuario[]> {
  const { data } = await api.get<FirmaUsuario[]>(rutaFirmas(usuarioId));
  return data;
}

/** PNG sin caché; cada descarga queda auditada. */
export async function obtenerImagenFirma(usuarioId: string, firmaId: string, senal?: AbortSignal): Promise<Blob> {
  const { data } = await api.get<Blob>(`${rutaFirmas(usuarioId)}/${encodeURIComponent(firmaId)}/imagen`, {
    responseType: 'blob',
    signal: senal,
  });
  return data;
}

/** Solo la vigente. Las historias ya firmadas no cambian. */
export async function desactivarFirma(usuarioId: string, firmaId: string, motivo: string): Promise<FirmaUsuario> {
  const { data } = await api.post<FirmaUsuario>(`${rutaFirmas(usuarioId)}/${encodeURIComponent(firmaId)}/desactivar`, {
    motivo,
  });
  return data;
}
