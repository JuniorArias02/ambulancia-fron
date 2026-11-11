import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CLAVES_CHEQUEOS } from '../constants/chequeos_diarios';
import { listarChequeos, obtenerChequeo } from '../services/chequeos_diarios.service';
import type { FiltrosChequeos } from '../types/chequeo_diario.types';

export function useChequeos(filtros: FiltrosChequeos) {
  return useQuery({
    queryKey: CLAVES_CHEQUEOS.lista(filtros),
    queryFn: () => listarChequeos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useChequeo(id: string) {
  return useQuery({
    queryKey: CLAVES_CHEQUEOS.detalle(id),
    queryFn: () => obtenerChequeo(id),
  });
}
