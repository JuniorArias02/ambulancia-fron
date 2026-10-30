import type { PerfilUsuario } from '../../profile/types/perfil.types';

export interface DatosInicioSesion {
  correo: string;
  contrasena: string;
}

export interface RespuestaSesionIniciada {
  tokenAcceso: string;
  tipoToken: 'Bearer';
  expiraEn: string;
  usuario: PerfilUsuario;
}

export type EstadoSesion = 'anonimo' | 'verificando' | 'autenticado' | 'error';

export type MotivoCierreSesion =
  | 'voluntario'
  | 'expirada'
  | 'no_autorizado'
  | 'contrasena_cambiada';
