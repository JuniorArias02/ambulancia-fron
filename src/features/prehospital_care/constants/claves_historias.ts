import type { FiltrosHistorias, FiltrosPacientes } from '../types/historia_clinica.types';

export const CLAVES_HISTORIAS = {
  todas: ['historias-clinicas'] as const,
  busqueda: (filtros: FiltrosHistorias) => ['historias-clinicas', 'busqueda', filtros] as const,
  detalle: (id: string) => ['historias-clinicas', 'detalle', id] as const,
  trazabilidad: (id: string, pagina: number) => ['historias-clinicas', 'trazabilidad', id, pagina] as const,
  ingreso: (numero: string) => ['historias-clinicas', 'ingreso', numero.toUpperCase()] as const,
  opciones: ['historias-clinicas', 'opciones'] as const,
  catalogos: ['historias-clinicas', 'catalogos'] as const,
  pacientes: (filtros: FiltrosPacientes) => ['historias-clinicas', 'pacientes', filtros] as const,
  ficha: (id: string) => ['historias-clinicas', 'ficha', id] as const,
  indicadores: (desde: string, hasta: string) => ['historias-clinicas', 'indicadores', desde, hasta] as const,
};
