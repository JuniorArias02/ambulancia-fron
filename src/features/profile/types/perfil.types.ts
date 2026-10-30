import type { NombreRol } from '../../../types/rol.types';

export interface PerfilUsuario {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: NombreRol;
}

export interface DatosCambioContrasena {
  contrasenaActual: string;
  contrasenaNueva: string;
}
