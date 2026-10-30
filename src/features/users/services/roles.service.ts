import { api } from '../../../services/api';
import type { RolSistema } from '../types/usuario.types';

export async function listarRoles(): Promise<RolSistema[]> {
  const { data } = await api.get<RolSistema[]>('/roles');
  return data;
}
