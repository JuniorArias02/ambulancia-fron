import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useIntervaloRespaldo } from '../../realtime/hooks/use_tiempo_real';
import { CLAVES_TURNOS, LIMITE_TURNOS_ACTIVOS } from '../constants/turnos';
import { listarTurnos } from '../services/turnos.service';
import type { FiltrosTurnos } from '../types/turno.types';

/** Respaldo sin tiempo real: la tripulación cambia desde la app, no desde la web. */
const INTERVALO_RESPALDO_MS = 15_000;

/** `enVivo`: mantiene al día un turno activo; los finalizados no cambian. */
export function useTurnos(filtros: FiltrosTurnos, { enVivo = false } = {}) {
  const respaldo = useIntervaloRespaldo(INTERVALO_RESPALDO_MS);
  return useQuery({
    queryKey: CLAVES_TURNOS.lista(filtros),
    queryFn: () => listarTurnos(filtros),
    placeholderData: keepPreviousData,
    refetchInterval: enVivo ? respaldo : false,
  });
}

/** Turnos activos de todas las ambulancias: el tablero de tripulaciones. */
export function useTurnosActivos() {
  const respaldo = useIntervaloRespaldo(INTERVALO_RESPALDO_MS);
  return useQuery({
    queryKey: CLAVES_TURNOS.activos,
    queryFn: () => listarTurnos({ estado: 'activo', pagina: 1, limite: LIMITE_TURNOS_ACTIVOS }),
    refetchInterval: respaldo,
  });
}
