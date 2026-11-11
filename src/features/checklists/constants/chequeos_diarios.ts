import type { EstadoChequeo, FiltrosChequeos } from '../types/chequeo_diario.types';

export const LIMITE_CHEQUEOS = 20;
/** Conductores que se cargan para el filtro. */
export const LIMITE_CONDUCTORES = 100;

export const ESTADOS_CHEQUEO = ['borrador', 'finalizado'] as const satisfies readonly EstadoChequeo[];

export const ETIQUETAS_ESTADO_CHEQUEO: Record<EstadoChequeo, string> = {
  borrador: 'En curso',
  finalizado: 'Finalizado',
};

export const CLAVES_CHEQUEOS = {
  lista: (filtros: FiltrosChequeos) => ['chequeos-diarios', 'lista', filtros] as const,
  detalle: (id: string) => ['chequeos-diarios', 'detalle', id] as const,
};
