import type { NombreRol } from '../../../types/rol.types';

export type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  estado: EstadoUsuario;
  rol: NombreRol;
  ultimoAcceso: string | null;
  creadoEn: string;
}

export interface RolSistema {
  id: string;
  nombre: NombreRol;
  descripcion: string;
}

export interface FiltrosUsuarios {
  busqueda?: string;
  estado?: EstadoUsuario;
  rol?: NombreRol;
  pagina: number;
  limite: number;
}

export interface DatosCrearUsuario {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  contrasena: string;
  rol: NombreRol;
}

/** Solo datos personales; `telefono: null` elimina el teléfono. */
export interface DatosActualizarUsuario {
  nombres?: string;
  apellidos?: string;
  telefono?: string | null;
}

export interface DatosCambioEstado {
  estado: EstadoUsuario;
  motivo: string;
}
