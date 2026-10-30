import { api } from '../../../services/api';
import type { DatosCambioContrasena, PerfilUsuario } from '../types/perfil.types';

export async function obtenerPerfil(): Promise<PerfilUsuario> {
  const { data } = await api.get<PerfilUsuario>('/autenticacion/perfil');
  return data;
}

/** El backend revoca todas las sesiones del usuario al cambiar la contraseña. */
export async function cambiarContrasena(datos: DatosCambioContrasena): Promise<void> {
  await api.patch('/autenticacion/contrasena', datos);
}
