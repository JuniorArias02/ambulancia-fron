import { api } from '../../../services/api';
import type { TipoAmbulancia } from '../types/ambulancia.types';

export async function listarTiposAmbulancia(): Promise<TipoAmbulancia[]> {
  const { data } = await api.get<TipoAmbulancia[]>('/tipos-ambulancia');
  return data;
}
