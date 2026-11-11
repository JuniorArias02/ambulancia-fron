import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  DatosDecision,
  FiltrosVerificaciones,
  VerificacionDetalle,
  VerificacionResumen,
} from '../types/verificacion.types';

const RUTA = '/verificaciones-ciudadanos';

export async function listarVerificaciones(
  filtros: FiltrosVerificaciones,
): Promise<ResultadoPaginado<VerificacionResumen>> {
  const { data } = await api.get<ResultadoPaginado<VerificacionResumen>>(RUTA, { params: filtros });
  return data;
}

/** Cada consulta queda registrada en la auditoría del backend. */
export async function obtenerVerificacion(usuarioId: string): Promise<VerificacionDetalle> {
  const { data } = await api.get<VerificacionDetalle>(`${RUTA}/${encodeURIComponent(usuarioId)}`);
  return data;
}

/**
 * La imagen exige el token, así que no sirve en un `<img src>` directo: se descarga como blob.
 * Cada descarga queda auditada.
 */
export async function obtenerFotoDocumento(
  usuarioId: string,
  documentoId: string,
  senal?: AbortSignal,
): Promise<Blob> {
  const { data } = await api.get<Blob>(
    `${RUTA}/${encodeURIComponent(usuarioId)}/documentos/${encodeURIComponent(documentoId)}`,
    { responseType: 'blob', signal: senal },
  );
  return data;
}

/** Responde el detalle actualizado. */
export async function decidirVerificacion(usuarioId: string, datos: DatosDecision): Promise<VerificacionDetalle> {
  const { data } = await api.post<VerificacionDetalle>(`${RUTA}/${encodeURIComponent(usuarioId)}/decision`, datos);
  return data;
}
