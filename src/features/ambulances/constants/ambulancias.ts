import type { FiltrosAmbulancias } from '../types/ambulancia.types';

export const LIMITE_POR_PAGINA = 20;
export const LIMITE_HISTORIAL = 20;

export const CLAVES_AMBULANCIAS = {
  todas: ['ambulancias'] as const,
  listas: ['ambulancias', 'lista'] as const,
  lista: (filtros: FiltrosAmbulancias) => ['ambulancias', 'lista', filtros] as const,
  /** Toda la flota, para el mapa. Va bajo `listas` para recibir las mismas actualizaciones. */
  flota: ['ambulancias', 'lista', 'flota'] as const,
  detalle: (id: string) => ['ambulancias', 'detalle', id] as const,
  historial: (id: string) => ['ambulancias', 'historial', id] as const,
  tipos: ['tipos-ambulancia'] as const,
};
