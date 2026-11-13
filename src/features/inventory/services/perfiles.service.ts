import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type {
  DatosCrearPerfil,
  DatosDatosPerfil,
  DatosDetallePerfil,
  FiltrosPerfiles,
  PerfilDotacion,
} from '../types/inventario.types';

const RUTA = '/inventario/perfiles-dotacion';
const rutaPerfil = (perfilId: string) => `${RUTA}/${encodeURIComponent(perfilId)}`;

export async function listarPerfiles(filtros: FiltrosPerfiles): Promise<ResultadoPaginado<PerfilDotacion>> {
  const { data } = await api.get<ResultadoPaginado<PerfilDotacion>>(RUTA, { params: filtros });
  return data;
}

export async function obtenerPerfil(perfilId: string): Promise<PerfilDotacion> {
  const { data } = await api.get<PerfilDotacion>(rutaPerfil(perfilId));
  return data;
}

/** Crea la versión 1 de un código, inactiva. Un código repetido para el tipo responde 409. */
export async function crearPerfil(datos: DatosCrearPerfil): Promise<PerfilDotacion> {
  const { data } = await api.post<PerfilDotacion>(RUTA, datos);
  return data;
}

export async function actualizarPerfil(perfilId: string, cambios: Partial<DatosDatosPerfil>): Promise<PerfilDotacion> {
  const { data } = await api.patch<PerfilDotacion>(rutaPerfil(perfilId), cambios);
  return data;
}

/** Solo un perfil activo por tipo: activar uno desactiva los demás. */
export async function cambiarEstadoPerfil(perfilId: string, activo: boolean): Promise<PerfilDotacion> {
  const { data } = await api.patch<PerfilDotacion>(`${rutaPerfil(perfilId)}/estado`, { activo });
  return data;
}

/** Copia inactiva y sin vigencia, con el número de versión siguiente. */
export async function crearVersionPerfil(perfilId: string): Promise<PerfilDotacion> {
  const { data } = await api.post<PerfilDotacion>(`${rutaPerfil(perfilId)}/versiones`);
  return data;
}

export async function agregarDetallePerfil(
  perfilId: string,
  datos: DatosDetallePerfil & { insumoId: string },
): Promise<PerfilDotacion> {
  const { data } = await api.post<PerfilDotacion>(`${rutaPerfil(perfilId)}/detalles`, datos);
  return data;
}

export async function actualizarDetallePerfil(
  perfilId: string,
  detalleId: string,
  cambios: Partial<DatosDetallePerfil>,
): Promise<PerfilDotacion> {
  const { data } = await api.patch<PerfilDotacion>(
    `${rutaPerfil(perfilId)}/detalles/${encodeURIComponent(detalleId)}`,
    cambios,
  );
  return data;
}

export async function quitarDetallePerfil(perfilId: string, detalleId: string): Promise<PerfilDotacion> {
  const { data } = await api.delete<PerfilDotacion>(`${rutaPerfil(perfilId)}/detalles/${encodeURIComponent(detalleId)}`);
  return data;
}
