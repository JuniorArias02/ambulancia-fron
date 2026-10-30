import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  DatosActualizarInstitucion,
  DatosCrearInstitucion,
  FiltrosInstituciones,
  InstitucionSalud,
} from '../types/institucion.types';

function rutaInstitucion(id: string): string {
  return `/instituciones-salud/${encodeURIComponent(id)}`;
}

export async function listarInstituciones(
  filtros: FiltrosInstituciones,
): Promise<ResultadoPaginado<InstitucionSalud>> {
  const { data } = await api.get<ResultadoPaginado<InstitucionSalud>>('/instituciones-salud', { params: filtros });
  return data;
}

export async function crearInstitucion(datos: DatosCrearInstitucion): Promise<InstitucionSalud> {
  const { data } = await api.post<InstitucionSalud>('/instituciones-salud', datos);
  return data;
}

export async function actualizarInstitucion(
  id: string,
  datos: DatosActualizarInstitucion,
): Promise<InstitucionSalud> {
  const { data } = await api.patch<InstitucionSalud>(rutaInstitucion(id), datos);
  return data;
}

/** Las instituciones no se borran: se inactivan. */
export async function cambiarEstadoInstitucion(id: string, activa: boolean): Promise<InstitucionSalud> {
  const { data } = await api.patch<InstitucionSalud>(`${rutaInstitucion(id)}/estado`, { activa });
  return data;
}
