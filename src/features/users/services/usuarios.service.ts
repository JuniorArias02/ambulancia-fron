import { api } from '../../../services/api';
import type { ResultadoPaginado } from '../../../types/paginacion.types';
import type { RolInterno } from '../../../types/rol.types';
import type {
  DatosActualizarUsuario,
  DatosCambioEstado,
  DatosCrearUsuario,
  FiltrosUsuarios,
  Usuario,
} from '../types/usuario.types';

export async function listarUsuarios(
  filtros: FiltrosUsuarios,
): Promise<ResultadoPaginado<Usuario>> {
  const { data } = await api.get<ResultadoPaginado<Usuario>>('/usuarios', { params: filtros });
  return data;
}

export async function obtenerUsuario(id: string): Promise<Usuario> {
  const { data } = await api.get<Usuario>(`/usuarios/${encodeURIComponent(id)}`);
  return data;
}

export async function crearUsuario(datos: DatosCrearUsuario): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/usuarios', datos);
  return data;
}

export async function actualizarUsuario(
  id: string,
  datos: DatosActualizarUsuario,
): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${encodeURIComponent(id)}`, datos);
  return data;
}

export async function cambiarRolUsuario(id: string, rol: RolInterno): Promise<Usuario> {
  const { data } = await api.put<Usuario>(`/usuarios/${encodeURIComponent(id)}/rol`, { rol });
  return data;
}

export async function cambiarEstadoUsuario(
  id: string,
  datos: DatosCambioEstado,
): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${encodeURIComponent(id)}/estado`, datos);
  return data;
}
