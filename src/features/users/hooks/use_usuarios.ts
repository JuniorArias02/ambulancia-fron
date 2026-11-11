import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CLAVES_USUARIOS } from '../constants/usuarios';
import { listarUsuarios, obtenerUsuario } from '../services/usuarios.service';
import type { FiltrosUsuarios } from '../types/usuario.types';

/** `habilitado` evita la consulta para roles sin acceso a `GET /usuarios`. */
export function useUsuarios(filtros: FiltrosUsuarios, habilitado = true) {
  return useQuery({
    queryKey: CLAVES_USUARIOS.lista(filtros),
    queryFn: () => listarUsuarios(filtros),
    placeholderData: keepPreviousData,
    enabled: habilitado,
  });
}

/** `habilitado` evita la consulta para roles sin acceso a `GET /usuarios/{id}`. */
export function useUsuario(id: string, habilitado = true) {
  return useQuery({
    queryKey: CLAVES_USUARIOS.detalle(id),
    queryFn: () => obtenerUsuario(id),
    enabled: habilitado,
    staleTime: 5 * 60_000,
  });
}
