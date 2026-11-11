import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CLAVES_LISTAS_CHEQUEO } from '../constants/listas_chequeo';
import { listarListasChequeo, obtenerListaChequeo } from '../services/listas_chequeo.service';
import type { FiltrosListasChequeo } from '../types/lista_chequeo.types';

export function useListasChequeo(filtros: FiltrosListasChequeo) {
  return useQuery({
    queryKey: CLAVES_LISTAS_CHEQUEO.lista(filtros),
    queryFn: () => listarListasChequeo(filtros),
    placeholderData: keepPreviousData,
  });
}

/** `habilitada` evita la consulta a quien no puede verla (solo el administrador). */
export function useListaChequeo(id: string, habilitada = true) {
  return useQuery({
    queryKey: CLAVES_LISTAS_CHEQUEO.detalle(id),
    queryFn: () => obtenerListaChequeo(id),
    enabled: habilitada,
  });
}
