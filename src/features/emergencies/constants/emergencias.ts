import type { FiltrosEmergencias } from '../types/emergencia.types';

export const LIMITE_POR_PAGINA = 20;

export const CLAVES_EMERGENCIAS = {
  todas: ['emergencias'] as const,
  listas: ['emergencias', 'lista'] as const,
  lista: (filtros: FiltrosEmergencias) => ['emergencias', 'lista', filtros] as const,
  detalle: (id: string) => ['emergencias', 'detalle', id] as const,
  todasDuplicadas: ['emergencias', 'duplicadas'] as const,
  duplicadas: (id: string) => ['emergencias', 'duplicadas', id] as const,
};
