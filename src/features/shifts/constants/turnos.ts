import type { FiltrosTurnos, FuncionTripulante } from '../types/turno.types';

export const FUNCIONES = ['conductor', 'paramedico', 'medico'] as const satisfies readonly FuncionTripulante[];

export const ETIQUETAS_FUNCION: Record<FuncionTripulante, string> = {
  conductor: 'Conductor',
  paramedico: 'Paramédico',
  medico: 'Médico',
};

/** Tablero del día: el backend admite hasta 100 por página. */
export const LIMITE_TURNOS_ACTIVOS = 100;
export const LIMITE_POR_PAGINA = 20;

export const CLAVES_TURNOS = {
  todos: ['turnos'] as const,
  lista: (filtros: FiltrosTurnos) => ['turnos', 'lista', filtros] as const,
  activos: ['turnos', 'lista', { estado: 'activo', pagina: 1, limite: LIMITE_TURNOS_ACTIVOS }] as const,
};
