import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listarUsuarios } from '../../users/services/usuarios.service';
import { CLAVES_TURNOS, LIMITE_TURNOS_ACTIVOS, type RolTripulante } from '../constants/turnos';
import { listarTurnos } from '../services/turnos.service';
import type { FiltrosTurnos } from '../types/turno.types';

/** Máximo que admite `GET /usuarios` por página. */
const LIMITE_PERSONAL = 100;

export function useTurnos(filtros: FiltrosTurnos) {
  return useQuery({
    queryKey: CLAVES_TURNOS.lista(filtros),
    queryFn: () => listarTurnos(filtros),
    placeholderData: keepPreviousData,
  });
}

/** Turnos activos de todas las ambulancias: tablero del día y control de ocupados. */
export function useTurnosActivos() {
  return useQuery({
    queryKey: CLAVES_TURNOS.activos,
    queryFn: () => listarTurnos({ estado: 'activo', pagina: 1, limite: LIMITE_TURNOS_ACTIVOS }),
  });
}

/** Personal activo de un rol para armar la tripulación. `GET /usuarios` es solo para administradores. */
export function usePersonal(rol: RolTripulante) {
  return useQuery({
    queryKey: CLAVES_TURNOS.personal(rol),
    queryFn: async () =>
      (await listarUsuarios({ rol, estado: 'activo', pagina: 1, limite: LIMITE_PERSONAL })).datos,
    staleTime: 60_000,
  });
}
