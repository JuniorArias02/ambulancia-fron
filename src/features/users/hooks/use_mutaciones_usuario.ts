import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RolInterno } from '../../../types/rol.types';
import { CLAVES_USUARIOS } from '../constants/usuarios';
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  crearUsuario,
  restablecerContrasenaUsuario,
} from '../services/usuarios.service';
import type { DatosActualizarUsuario, DatosCambioEstado } from '../types/usuario.types';

/** Tras cada mutación confirmada se recargan los listados desde el backend. */
function useInvalidarUsuarios() {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: CLAVES_USUARIOS.todos });
}

export function useCrearUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({ mutationFn: crearUsuario, onSuccess: invalidar });
}

export function useActualizarUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosActualizarUsuario }) =>
      actualizarUsuario(id, datos),
    onSuccess: invalidar,
  });
}

export function useCambiarRolUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: ({ id, rol }: { id: string; rol: RolInterno }) => cambiarRolUsuario(id, rol),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: DatosCambioEstado }) =>
      cambiarEstadoUsuario(id, datos),
    onSuccess: invalidar,
  });
}

/**
 * No cambia ningún dato de la lista, así que no invalida nada. `gcTime: 0` saca la mutación
 * de la caché al cerrar el diálogo, para que la contraseña no quede guardada en sus variables.
 */
export function useRestablecerContrasena() {
  return useMutation({
    mutationFn: ({ id, contrasenaNueva }: { id: string; contrasenaNueva: string }) =>
      restablecerContrasenaUsuario(id, contrasenaNueva),
    gcTime: 0,
  });
}
