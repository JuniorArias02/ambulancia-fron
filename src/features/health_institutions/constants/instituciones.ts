import type { FiltrosInstituciones, NivelComplejidad } from '../types/institucion.types';

export const NIVELES_COMPLEJIDAD = ['baja', 'mediana', 'alta'] as const satisfies readonly NivelComplejidad[];

export const ETIQUETAS_NIVEL: Record<NivelComplejidad, string> = {
  baja: 'Baja complejidad',
  mediana: 'Mediana complejidad',
  alta: 'Alta complejidad',
};

export const LIMITE_POR_PAGINA = 20;

export const CLAVES_INSTITUCIONES = {
  todas: ['instituciones-salud'] as const,
  lista: (filtros: FiltrosInstituciones) => ['instituciones-salud', 'lista', filtros] as const,
};
