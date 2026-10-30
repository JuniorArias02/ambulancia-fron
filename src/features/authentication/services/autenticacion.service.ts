import { api } from '../../../services/api';
import type {
  DatosInicioSesion,
  RespuestaSesionIniciada,
} from '../types/autenticacion.types';

export async function iniciarSesion(
  datos: DatosInicioSesion,
): Promise<RespuestaSesionIniciada> {
  const { data } = await api.post<RespuestaSesionIniciada>(
    '/autenticacion/iniciar-sesion',
    datos,
  );
  return data;
}

export async function cerrarSesion(): Promise<void> {
  await api.post('/autenticacion/cerrar-sesion');
}
