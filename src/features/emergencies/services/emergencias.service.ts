import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  DatosActualizarEmergencia,
  DatosCrearEmergencia,
  Emergencia,
  FiltrosEmergencias,
  PosibleDuplicada,
} from '../types/emergencia.types';
import { inicioDelDia, finDelDia } from '../utils/formato_emergencia';

function rutaEmergencia(id: string): string {
  return `/emergencias/${encodeURIComponent(id)}`;
}

export async function listarEmergencias(
  filtros: FiltrosEmergencias,
): Promise<ResultadoPaginado<Emergencia>> {
  const { desde, hasta, soloActivas, ...resto } = filtros;
  const { data } = await api.get<ResultadoPaginado<Emergencia>>('/emergencias', {
    params: {
      ...resto,
      soloActivas: soloActivas ? true : undefined,
      desde: desde ? inicioDelDia(desde) : undefined,
      hasta: hasta ? finDelDia(hasta) : undefined,
    },
  });
  return data;
}

export async function obtenerEmergencia(id: string): Promise<Emergencia> {
  const { data } = await api.get<Emergencia>(rutaEmergencia(id));
  return data;
}

export async function crearEmergencia(datos: DatosCrearEmergencia): Promise<Emergencia> {
  const { data } = await api.post<Emergencia>('/emergencias', datos);
  return data;
}

export async function actualizarEmergencia(
  id: string,
  datos: DatosActualizarEmergencia,
): Promise<Emergencia> {
  const { data } = await api.patch<Emergencia>(rutaEmergencia(id), datos);
  return data;
}

export async function cancelarEmergencia(id: string, motivo: string): Promise<Emergencia> {
  const { data } = await api.patch<Emergencia>(`${rutaEmergencia(id)}/cancelar`, { motivo });
  return data;
}

export async function listarPosiblesDuplicadas(id: string): Promise<PosibleDuplicada[]> {
  const { data } = await api.get<PosibleDuplicada[]>(`${rutaEmergencia(id)}/posibles-duplicadas`);
  return data;
}

/** `id` es la llamada repetida; `emergenciaPrincipalId`, la que sí se atiende. */
export async function marcarDuplicada(id: string, emergenciaPrincipalId: string): Promise<Emergencia> {
  const { data } = await api.patch<Emergencia>(`${rutaEmergencia(id)}/duplicada`, {
    emergenciaPrincipalId,
  });
  return data;
}
