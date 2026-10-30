import type { FiltrosUsuarios } from '../types/usuario.types';

export const LIMITE_POR_PAGINA = 20;

export const CLAVES_USUARIOS = {
  todos: ['usuarios'] as const,
  lista: (filtros: FiltrosUsuarios) => ['usuarios', 'lista', filtros] as const,
  detalle: (id: string) => ['usuarios', 'detalle', id] as const,
  roles: ['roles'] as const,
};
